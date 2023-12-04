/**
 * @fileoverview Service for managing webhooks in Satoshi Showdown.
 * Handles creating, updating, retrieving, and deleting webhooks,
 * interfacing with both BlockCypher and the local database.
 */

const Webhook = require('../models/webhookModel');
const { v4: uuidv4 } = require('uuid');
const { getAPI, postAPI } = require('../utils/apiUtil');
const { NotFoundError } = require('../utils/errorUtil');
const log = require('../utils/logUtil');

// Configuration constants
const apiBaseUrl = process.env.BLOCKCYPHER_BASE_URL;
const apiToken = process.env.BLOCKCYPHER_TOKEN;

/**
 * Creates and registers a new webhook with BlockCypher for event monitoring.
 * 
 * @param {string} address - Blockchain address to monitor.
 * @param {string} transactionId - Associated transaction ID.
 * @param {number} [confirmations=6] - Confirmation count threshold.
 * @returns {Promise<Object>} The created webhook object.
 */
const createWebhook = async (address, transactionId, confirmations = 6) => {
    const uniqueId = uuidv4();
    const callbackUrl = `${process.env.WEBHOOK_DOMAIN}/webhook/receive/${uniqueId}`;
    const webhookData = { event: "tx-confirmation", address, url: callbackUrl, confirmations, token: apiToken };

    try {
        await postAPI(`${apiBaseUrl}/hooks?token=${apiToken}`, webhookData);
        log.info(`Webhook for address ${address} created successfully.`);

        const newWebhook = new Webhook({ uniqueId, address, transactionId, type: "tx-confirmation", status: "pending", url: callbackUrl });
        await newWebhook.save();
        return newWebhook;
    } catch (err) {
        log.error(`Error in createWebhook: ${err.message}`);
        throw err;
    }
};

/**
 * Retrieves a specific webhook by its unique identifier.
 * 
 * @param {string} uniqueId - Unique identifier of the webhook.
 * @returns {Promise<Object>} The found webhook object.
 */
const getWebhook = async (uniqueId) => {
    const webhook = await Webhook.findOne({ uniqueId });
    if (!webhook) {
        log.warn(`Webhook with uniqueId ${uniqueId} not found`);
        throw new NotFoundError(`Webhook with uniqueId ${uniqueId} not found`);
    }
    return webhook;
};

/**
 * Retrieves all webhooks from the database.
 * 
 * @returns {Promise<Array>} An array of all webhooks.
 */
const getAllWebhooks = async () => {
    return await Webhook.find({});
};

/**
 * Updates a webhook in the database with new data.
 * 
 * @param {string} uniqueId - Unique identifier of the webhook.
 * @param {Object} updateData - New data for the webhook.
 * @returns {Promise<Object>} The updated webhook object.
 */
const updateWebhook = async (uniqueId, updateData) => {
    const webhook = await Webhook.findOneAndUpdate({ uniqueId }, updateData, { new: true });
    if (!webhook) {
        log.warn(`Webhook with uniqueId ${uniqueId} not found for update`);
        throw new NotFoundError(`Webhook with uniqueId ${uniqueId} not found`);
    }
    return webhook;
};

/**
 * Deletes a webhook from both BlockCypher and the local database.
 * 
 * @param {string} webhookId - ID of the webhook to delete.
 * @returns {Promise<void>}
 */
const deleteWebhook = async (webhookId) => {
    const webhook = await getWebhook(webhookId);
    try {
        await getAPI(`${apiBaseUrl}/hooks/${webhookId}?token=${apiToken}`);
        log.info(`Webhook with uniqueId ${webhookId} deleted from BlockCypher.`);
        await Webhook.deleteOne({ uniqueId: webhookId });
        log.info(`Webhook with uniqueId ${webhookId} deleted from local database.`);
    } catch (err) {
        log.error(`Error deleting webhook: ${err.message}`);
        throw err;
    }
};

/**
 * Handles incoming webhook data, updating the related records in the database.
 * 
 * @param {string} uniqueId - Unique identifier of the webhook.
 * @param {Object} data - Payload received from the webhook.
 * @returns {Promise<void>}
 */
const processWebhook = async (uniqueId, data) => {
    log.debug(`Received webhook data for uniqueId ${uniqueId}: ${JSON.stringify(data)}`);
    const webhook = await getWebhook(uniqueId);
    // Add logic to process the webhook data
    // This part of the code will vary depending on the specific application needs
};

module.exports = {
    createWebhook,
    getWebhook,
    getAllWebhooks,
    updateWebhook,
    deleteWebhook,
    processWebhook
};
