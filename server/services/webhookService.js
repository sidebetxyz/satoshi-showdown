/**
 * @fileoverview Service for managing webhooks in Satoshi Showdown.
 * Handles creating, updating, retrieving, and soft deleting webhooks,
 * interfacing with both BlockCypher and the local database.
 */

const Webhook = require('../models/webhookModel');
const { postAPI, getAPI } = require('../utils/apiUtil');
const { NotFoundError } = require('../utils/errorUtil');
const log = require('../utils/logUtil');

// Configuration constants
const apiBaseUrl = process.env.BLOCKCYPHER_BASE_URL;
const apiToken = process.env.BLOCKCYPHER_TOKEN;

/**
 * Creates and registers a new webhook with BlockCypher for event monitoring.
 * @param {string} address - Blockchain address to monitor.
 * @param {string} transactionRef - Associated transaction Reference ID.
 * @param {number} [confirmations=6] - Confirmation count threshold.
 * @returns {Promise<Object>} The created webhook object.
 */
const createWebhook = async (address, transactionRef) => {
    try {
        const newWebhook = new Webhook({
            type: "tx-confirmation",
            transaction: transactionRef
        });
        await newWebhook.save();

        const callbackUrl = `${process.env.WEBHOOK_DOMAIN}/webhook/receive/${newWebhook.urlId}`;
        const webhookData = {
            event: "tx-confirmation",
            address,
            url: callbackUrl,
            confirmations: 6,
            token: apiToken
        };

        const response = await postAPI(`${apiBaseUrl}/hooks?token=${apiToken}`, webhookData);
        await Webhook.findByIdAndUpdate(newWebhook._id, { response });

        log.info(`Webhook for address ${address} created successfully with URL ID: ${newWebhook.urlId}. Response: ${JSON.stringify(response)}`);
        return newWebhook;
    } catch (err) {
        log.error(`Error in createWebhook: ${err.message}`);
        throw err;
    }
};

/**
 * Retrieves a specific webhook by its URL identifier.
 * @param {string} urlId - URL identifier of the webhook.
 * @returns {Promise<Object>} The found webhook object.
 */
const getWebhook = async (urlId) => {
    const webhook = await Webhook.findOne({ urlId });
    if (!webhook) {
        log.warn(`Webhook with URL ID ${urlId} not found`);
        throw new NotFoundError(`Webhook with URL ID ${urlId} not found`);
    }
    return webhook;
};

/**
 * Retrieves all webhooks from the database.
 * @returns {Promise<Array>} An array of all webhooks.
 */
const getAllWebhooks = async () => {
    return await Webhook.find({});
};

/**
 * Updates a webhook in the database with new data.
 * @param {string} urlId - URL identifier of the webhook.
 * @param {Object} updateData - New data for the webhook.
 * @returns {Promise<Object>} The updated webhook object.
 */
const updateWebhook = async (urlId, updateData) => {
    const webhook = await Webhook.findOneAndUpdate({ urlId }, updateData, { new: true });
    if (!webhook) {
        log.warn(`Webhook with URL ID ${urlId} not found for update`);
        throw new NotFoundError(`Webhook with URL ID ${urlId} not found`);
    }
    return webhook;
};

/**
 * Soft deletes a webhook in the local database but removes it from BlockCypher.
 * @param {string} webhookId - ID of the webhook to soft delete.
 * @returns {Promise<void>}
 */
const deleteWebhook = async (webhookId) => {
    const webhook = await getWebhook(webhookId);
    try {
        await getAPI(`${apiBaseUrl}/hooks/${webhookId}?token=${apiToken}`);
        log.info(`Webhook with uniqueId ${webhookId} removed from BlockCypher.`);

        await Webhook.findByIdAndUpdate(webhook._id, { isDeleted: true });
        log.info(`Webhook with URL ID ${webhookId} soft deleted in local database.`);
    } catch (err) {
        log.error(`Error in soft deleting webhook: ${err.message}`);
        throw err;
    }
};

/**
 * Handles incoming webhook data, updating the related records in the database.
 * @param {string} urlId - URL identifier of the webhook.
 * @param {Object} headers - Headers of the webhook request.
 * @param {Object} data - Payload received from the webhook.
 * @returns {Promise<void>}
 */
const processWebhook = async (urlId, headers, data) => {
    log.debug(`Received webhook data for URL ID ${urlId}`);
    log.debug(`Headers: ${JSON.stringify(headers)}`);
    log.debug(`Body: ${JSON.stringify(data)}`);

    const webhook = await getWebhook(urlId);

    if (!webhook) {
        log.error(`Webhook with URL ID ${urlId} not found`);
        return;
    }

    try {
        // Convert headers to Map for Mongoose
        const headersMap = new Map(Object.entries(headers));

        // Update the webhook document with received headers and body
        await updateWebhook(urlId, { headers: headersMap, body: data });

        // Further processing based on the webhook data
        // ...

        log.info(`Webhook with URL ID ${urlId} processed successfully`);
    } catch (error) {
        log.error(`Error processing webhook with URL ID ${urlId}: ${error.message}`);
    }
};

module.exports = {
    createWebhook,
    getWebhook,
    getAllWebhooks,
    updateWebhook,
    deleteWebhook,
    processWebhook
};
