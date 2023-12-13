/**
 * @fileoverview Service for managing webhooks in Satoshi Showdown.
 * This service is responsible for creating, updating, retrieving, and managing
 * the deletion of webhooks. It interfaces with external services like BlockCypher
 * for blockchain event monitoring and interacts with the local database for webhook
 * data management. The service plays a crucial role in event-driven processes within
 * the application, especially for transaction and blockchain event monitoring.
 *
 * @module services/webhookService
 * @requires models/webhookModel - Webhook data model for database interactions.
 * @requires services/transactionService - Service for updating transaction records.
 * @requires services/walletService - Service for wallet-related operations.
 * @requires utils/apiUtil - Utility functions for API interactions.
 * @requires utils/errorUtil - Custom error classes and error handling utilities.
 * @requires utils/logUtil - Logging utility for application-wide logging.
 */

const Webhook = require("../models/webhookModel");
const { updateTransactionRecord } = require("./transactionService");
const { getWalletByAddress, updateWalletBalance } = require("./walletService");
const { postAPI, getAPI } = require("../utils/apiUtil");
const { NotFoundError } = require("../utils/errorUtil");
const log = require("../utils/logUtil");

// Configuration constants for external API
const apiBaseUrl = process.env.BLOCKCYPHER_BASE_URL;
const apiToken = process.env.BLOCKCYPHER_TOKEN;

/**
 * Creates and registers a new webhook with BlockCypher for event monitoring.
 * It sets up a webhook to monitor specific blockchain events related to a given address.
 * The webhook is stored in the local database and registered with BlockCypher.
 *
 * @async
 * @function createWebhook
 * @param {string} address - Blockchain address to monitor for transactions.
 * @param {string} transactionRef - Associated transaction reference ID.
 * @param {number} [confirmations=6] - Number of confirmations for transaction finality (default is 6).
 * @return {Promise<Object>} The created webhook object containing its configuration and response data.
 * @throws {Error} Thrown if there is an issue creating the webhook in the database or with BlockCypher.
 */
const createWebhook = async (address, transactionRef) => {
  try {
    // Create a new webhook in the local database
    const newWebhook = new Webhook({
      type: "tx-confirmation",
      transaction: transactionRef,
    });
    await newWebhook.save();

    // Generate a callback URL for the webhook
    const callbackUrl = `${process.env.WEBHOOK_DOMAIN}/webhook/receive/${newWebhook.urlId}`;
    const webhookData = {
      event: "tx-confirmation",
      address,
      url: callbackUrl,
      confirmations: 6,
      token: apiToken,
    };

    // Register the webhook with BlockCypher and get the response
    const response = await postAPI(
      `${apiBaseUrl}/hooks?token=${apiToken}`,
      webhookData,
    );

    log.debug(`Response: ${JSON.stringify(response, null, 2)}`);

    // Update the webhook document in the local database with the response data
    await Webhook.findByIdAndUpdate(newWebhook._id, { response });

    return newWebhook;
  } catch (err) {
    log.error(`Error in createWebhook: ${err.message}`);
    throw err;
  }
};

/**
 * Retrieves a specific webhook by its URL identifier.
 * This is primarily used for fetching webhook details for processing incoming requests or for updates.
 *
 * @async
 * @function getWebhook
 * @param {string} urlId - URL identifier of the webhook to retrieve.
 * @return {Promise<Object>} The retrieved webhook object, if found.
 * @throws {NotFoundError} If the webhook with the specified URL ID is not found.
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
 * Retrieves all webhooks currently stored in the database.
 * This can be used for administrative purposes such as monitoring or auditing webhook activities.
 *
 * @async
 * @function getAllWebhooks
 * @return {Promise<Array>} An array of all webhook objects in the database.
 */
const getAllWebhooks = async () => {
  return await Webhook.find({});
};

/**
 * Updates a webhook's configuration in the database.
 * This is used for modifying webhook details, like changing its monitoring conditions or callback URL.
 *
 * @async
 * @function updateWebhook
 * @param {string} urlId - URL identifier of the webhook to update.
 * @param {Object} updateData - New data to update the webhook with.
 * @return {Promise<Object>} The updated webhook object.
 * @throws {NotFoundError} If the webhook with the specified URL ID is not found for updating.
 */
const updateWebhook = async (urlId, updateData) => {
  const webhook = await Webhook.findOneAndUpdate({ urlId }, updateData, {
    new: true,
  });
  if (!webhook) {
    log.warn(`Webhook with URL ID ${urlId} not found for update`);
    throw new NotFoundError(`Webhook with URL ID ${urlId} not found`);
  }
  return webhook;
};

/**
 * Soft deletes a webhook in the local database and removes its registration from BlockCypher.
 * This helps in maintaining a record of the webhook while ensuring it's no longer active.
 *
 * @async
 * @function deleteWebhook
 * @param {string} webhookId - ID of the webhook to soft delete.
 * @return {Promise<void>}
 * @throws {Error} If there's an issue in removing the webhook from BlockCypher or updating the database.
 */
const deleteWebhook = async (webhookId) => {
  const webhook = await getWebhook(webhookId);
  try {
    // Remove the webhook registration from BlockCypher
    await getAPI(`${apiBaseUrl}/hooks/${webhookId}?token=${apiToken}`);
    log.info(`Webhook with uniqueId ${webhookId} removed from BlockCypher.`);

    // Soft delete the webhook in the local database
    await Webhook.findByIdAndUpdate(webhook._id, { isDeleted: true });
    log.info(
      `Webhook with URL ID ${webhookId} soft deleted in the local database.`,
    );
  } catch (err) {
    log.error(`Error in soft deleting webhook: ${err.message}`);
    throw err;
  }
};

/**
 * Processes incoming webhook data, performing necessary updates on transaction records and wallets.
 * This function is a key component in the webhook lifecycle, handling the business logic triggered by webhook events.
 *
 * @async
 * @function processWebhook
 * @param {string} urlId - The URL identifier of the webhook.
 * @param {Object} headers - The headers of the incoming webhook request.
 * @param {Object} data - The payload of the webhook request, containing transaction details.
 * @return {Promise<void>}
 * @throws {NotFoundError} If the webhook or related transaction is not found for processing.
 */
const processWebhook = async (urlId, headers, data) => {
  log.debug(`Received webhook data for URL ID: ${urlId}`);
  try {
    const webhook = await Webhook.findOne({ urlId });

    if (!webhook) {
      log.error(`Webhook with URL ID ${urlId} not found`);
      throw new NotFoundError(`Webhook with URL ID ${urlId} not found`);
    }

    // Convert headers to a Map for Mongoose and update the webhook record
    const headersMap = new Map(Object.entries(headers));
    await Webhook.findByIdAndUpdate(webhook._id, {
      headers: headersMap,
      body: data,
    });

    // Extract monitored address and amount from the webhook's response
    const monitoredAddress = webhook.response.address;
    let amountReceived = 0;

    // Check each output to find the amount sent to the monitored address
    data.outputs.forEach((output) => {
      if (output.addresses.includes(monitoredAddress)) {
        amountReceived += output.value;
      }
    });

    if (amountReceived > 0) {
      // Determine the transaction status based on the number of confirmations
      let transactionStatus = "confirming";
      if (data.confirmations >= 6) {
        transactionStatus = "completed";
      }

      // Update the transaction record with new data
      const updatedTransaction = await updateTransactionRecord(
        webhook.transaction,
        {
          confirmations: data.confirmations,
          status: transactionStatus,
          receivedAmount: amountReceived,
          // Additional fields to update can be added here
        },
      );

      // Retrieve the wallet by its public address
      const wallet = await getWalletByAddress(monitoredAddress);

      // Update the wallet's balance with the received amount
      const newBalance = wallet.balance + amountReceived;
      await updateWalletBalance(wallet._id, newBalance);

      log.info(
        `Transaction with ID ${updatedTransaction._id} updated. Status: ${transactionStatus}, Amount received: ${amountReceived}`,
      );
    } else {
      log.info(
        `No transaction amount for monitored address: ${monitoredAddress}`,
      );
    }
  } catch (error) {
    log.error(
      `Error processing webhook with URL ID ${urlId}: ${error.message}`,
    );
    throw error;
  }
};

module.exports = {
  createWebhook,
  getWebhook,
  getAllWebhooks,
  updateWebhook,
  deleteWebhook,
  processWebhook,
};
