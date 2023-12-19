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
      transactionRef,
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
  const webhook = await _getWebhook(webhookId);
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
 * Processes incoming webhook data and updates the corresponding transaction and wallet records.
 * Utilizes modular functions to handle different aspects of the webhook: headers, body, and status.
 * This structured approach ensures efficient and accurate processing of blockchain event data.
 *
 * @async
 * @function processWebhook
 * @param {string} urlId - The URL identifier of the webhook.
 * @param {Object} headers - The headers of the incoming webhook request.
 * @param {Object} data - The payload of the webhook request, containing transaction details.
 * @throws {NotFoundError} Thrown if the webhook with the given URL ID is not found.
 */
const processWebhook = async (urlId, headers, data) => {
  log.debug(`Received webhook data for URL ID: ${urlId}`);
  try {
    // Retrieve the webhook using the private _getWebhook function
    let webhook = await _getWebhook(urlId);

    // Process the headers, body, and status of the webhook
    const updateData = {
      headers: await _processWebhookHeaders(headers),
      body: await _processWebhookBody(data),
      ...(await _processWebhookStatus(webhook, data.confirmations)),
    };

    // Update the webhook with the processed data
    webhook = await _updateWebhook(urlId, updateData);

    // Process the transaction and wallet updates
    const { transactionUpdate, walletUpdate } =
      await _processWebhookTransactionData(webhook);
    console.log(transactionUpdate, walletUpdate);
  } catch (error) {
    log.error(
      `Error processing webhook with URL ID ${urlId}: ${error.message}`,
    );
    throw error;
  }
};

/**
 * Retrieves a specific webhook by its URL identifier.
 * This private function is used within the service for fetching webhook details.
 *
 * @async
 * @private
 * @function _getWebhook
 * @param {string} urlId - URL identifier of the webhook to retrieve.
 * @return {Promise<Object>} The retrieved webhook object, if found.
 * @throws {NotFoundError} If the webhook with the specified URL ID is not found.
 */
const _getWebhook = async (urlId) => {
  const webhook = await Webhook.findOne({ urlId });
  if (!webhook) {
    log.warn(`Webhook with URL ID ${urlId} not found`);
    throw new NotFoundError(`Webhook with URL ID ${urlId} not found`);
  }
  return webhook;
};

/**
 * Processes the headers received from a webhook call and returns simplified header information.
 * Extracts and logs relevant information from the headers for debugging and audit purposes.
 *
 * @async
 * @private
 * @function _processWebhookHeaders
 * @param {Object} headers - The headers of the incoming webhook request.
 * @return {Object} Simplified headers object.
 */
const _processWebhookHeaders = async (headers) => {
  log.debug(`Processing webhook headers`);

  const simplifiedHeaders = {
    host: headers.host,
    userAgent: headers["user-agent"],
    eventId: headers["x-eventid"],
    eventType: headers["x-eventtype"],
    rateLimitRemaining: headers["x-ratelimit-remaining"],
  };

  log.info(`Webhook headers processed: ${JSON.stringify(simplifiedHeaders)}`);
  return simplifiedHeaders;
};

/**
 * Processes the body of the webhook request and returns structured transaction data.
 * This function parses the transaction data to understand the nature of the transaction,
 * such as the involved addresses, amounts, confirmations, and other relevant details.
 *
 * @async
 * @private
 * @function _processWebhookBody
 * @param {Object} body - The payload of the webhook request.
 * @return {Object} Structured transaction data.
 */
const _processWebhookBody = async (body) => {
  log.debug(`Processing webhook body`);

  const transactionData = {
    hash: body.hash,
    totalAmount: body.total,
    fees: body.fees,
    confirmations: body.confirmations,
    inputs: body.inputs.map((input) => ({
      prevHash: input.prev_hash,
      outputValue: input.output_value,
      addresses: input.addresses,
    })),
    outputs: body.outputs.map((output) => ({
      value: output.value,
      addresses: output.addresses,
    })),
  };

  log.info(`Webhook body processed: ${JSON.stringify(transactionData)}`);
  return transactionData;
};

/**
 * Processes the status of a webhook based on the current count of confirmations.
 * This function updates the webhook's status to 'processing' upon first-time processing
 * and tracks each confirmation by updating the confirmationsReceived array. It assumes
 * confirmations are received sequentially and in order. The method is specifically designed
 * to accurately timestamp the arrival of each confirmation.
 *
 * @async
 * @private
 * @function _processWebhookStatus
 * @param {Webhook} webhook - The webhook document being evaluated.
 * @param {number} currentConfirmations - The number of confirmations currently received for the transaction.
 * @return {Object} An object containing updates for the webhook's status and the confirmationsReceived array.
 * @throws {Error} Thrown if any issues occur while processing the webhook status.
 */
const _processWebhookStatus = async (webhook, currentConfirmations) => {
  // Prepare an object to hold potential updates
  const statusUpdate = {
    status: webhook.status, // Maintain the current status
    lastProcessedConfirmation: webhook.currentConfirmation, // Update the last processed confirmation
    currentConfirmation: currentConfirmations, // Set the current confirmation count
    confirmationsReceived: webhook.confirmationsReceived.slice(), // Clone the existing confirmations array
  };

  // Change status to 'processing' upon initial processing of the webhook
  if (webhook.status === "pending") {
    statusUpdate.status = "processing";
  }

  // Update the confirmationsReceived array with the current confirmation and timestamp
  statusUpdate.confirmationsReceived[currentConfirmations] = {
    confirmationNumber: currentConfirmations,
    timestamp: new Date(),
  };

  return statusUpdate;
};

/**
 * Prepares the transaction and wallet update data based on the transaction details from the webhook body.
 * Calculates the amount involved for the monitored address and determines the necessary updates based on
 * the number of confirmations.
 *
 * @async
 * @private
 * @function _processWebhookTransactionData
 * @param {Webhook} webhook - The webhook document containing response data.
 * @param {Object} transactionDetails - The processed transaction details from the webhook body.
 * @return {Object} An object containing the transaction update and wallet update data.
 * @throws {Error} Thrown if there is an issue preparing the transaction or wallet update data.
 */
const _processWebhookTransactionData = async (webhook) => {
  const monitoredAddress = webhook.response.address;

  // Calculate the total amount involved for the monitored address
  const amountInvolved = webhook.body.outputs.reduce((sum, output) => {
    if (output.addresses.includes(monitoredAddress)) {
      return sum + output.value;
    }
    return sum;
  }, 0);

  if (amountInvolved > 0) {
    // Determine the transaction status based on the number of confirmations
    const isConfirmed = webhook.body.confirmations >= 6;
    const transactionStatus = isConfirmed ? "completed" : "confirming";

    // Prepare transaction update data
    const transactionUpdate = {
      confirmations: webhook.body.confirmations,
      status: transactionStatus,
    };

    if (isConfirmed) {
      transactionUpdate.confirmedAmount = amountInvolved;
      transactionUpdate.unconfirmedAmount = 0;
    } else {
      transactionUpdate.unconfirmedAmount = amountInvolved;
      transactionUpdate.confirmedAmount = 0;
    }

    // Prepare wallet update data (if confirmed)
    const walletUpdate = null;

    return { transactionUpdate, walletUpdate };
  } else {
    log.info(
      `No transaction amount for monitored address: ${monitoredAddress}`,
    );
    return { transactionUpdate: null, walletUpdate: null };
  }
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
const _updateWebhook = async (urlId, updateData) => {
  const webhook = await Webhook.findOneAndUpdate({ urlId }, updateData, {
    new: true,
  });
  if (!webhook) {
    log.warn(`Webhook with URL ID ${urlId} not found for update`);
    throw new NotFoundError(`Webhook with URL ID ${urlId} not found`);
  }
  return webhook;
};

module.exports = {
  createWebhook,
  getAllWebhooks,
  deleteWebhook,
  processWebhook,
};
