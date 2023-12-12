/**
 * @fileoverview Service for managing webhooks in Satoshi Showdown.
 * Handles creating, updating, retrieving, and soft deleting webhooks,
 * interfacing with both BlockCypher and the local database.
 */

const Webhook = require("../models/webhookModel");
const { updateTransactionRecord } = require("./transactionService");
const { getWalletByAddress, updateWalletBalance } = require("./walletService");
const { postAPI, getAPI } = require("../utils/apiUtil");
const { NotFoundError } = require("../utils/errorUtil");
const log = require("../utils/logUtil");

// Configuration constants
const apiBaseUrl = process.env.BLOCKCYPHER_BASE_URL;
const apiToken = process.env.BLOCKCYPHER_TOKEN;

/**
 * Creates and registers a new webhook with BlockCypher for event monitoring.
 * @param {string} address - Blockchain address to monitor.
 * @param {string} transactionRef - Associated transaction Reference ID.
 * @param {number} [confirmations=6] - Confirmation count threshold.
 * @return {Promise<Object>} The created webhook object.
 */
const createWebhook = async (address, transactionRef) => {
  try {
    const newWebhook = new Webhook({
      type: "tx-confirmation",
      transaction: transactionRef,
    });
    await newWebhook.save();

    const callbackUrl = `${process.env.WEBHOOK_DOMAIN}/webhook/receive/${newWebhook.urlId}`;
    const webhookData = {
      event: "tx-confirmation",
      address,
      url: callbackUrl,
      confirmations: 6,
      token: apiToken,
    };

    const response = await postAPI(
      `${apiBaseUrl}/hooks?token=${apiToken}`,
      webhookData,
    );

    log.debug(`Response: ${JSON.stringify(response, null, 2)}`);

    await Webhook.findByIdAndUpdate(newWebhook._id, { response });

    return newWebhook;
  } catch (err) {
    log.error(`Error in createWebhook: ${err.message}`);
    throw err;
  }
};

/**
 * Retrieves a specific webhook by its URL identifier.
 * @param {string} urlId - URL identifier of the webhook.
 * @return {Promise<Object>} The found webhook object.
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
 * @return {Promise<Array>} An array of all webhooks.
 */
const getAllWebhooks = async () => {
  return await Webhook.find({});
};

/**
 * Updates a webhook in the database with new data.
 * @param {string} urlId - URL identifier of the webhook.
 * @param {Object} updateData - New data for the webhook.
 * @return {Promise<Object>} The updated webhook object.
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
 * Soft deletes a webhook in the local database but removes it from BlockCypher.
 * @param {string} webhookId - ID of the webhook to soft delete.
 * @return {Promise<void>}
 */
const deleteWebhook = async (webhookId) => {
  const webhook = await getWebhook(webhookId);
  try {
    await getAPI(`${apiBaseUrl}/hooks/${webhookId}?token=${apiToken}`);
    log.info(`Webhook with uniqueId ${webhookId} removed from BlockCypher.`);

    await Webhook.findByIdAndUpdate(webhook._id, { isDeleted: true });
    log.info(
      `Webhook with URL ID ${webhookId} soft deleted in local database.`,
    );
  } catch (err) {
    log.error(`Error in soft deleting webhook: ${err.message}`);
    throw err;
  }
};

/**
 * Processes incoming webhook data, updating transaction records and other
 * related entities in the database.
 *
 * @param {string} urlId - The URL identifier of the webhook.
 * @param {Object} headers - The headers of the incoming webhook request.
 * @param {Object} data - The body of the webhook request, containing transaction details.
 * @return {Promise<void>}
 * @throws {NotFoundError} If the webhook or related transaction is not found.
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

        console.log("amountReceived: ", amountReceived); // deleteDebug
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
