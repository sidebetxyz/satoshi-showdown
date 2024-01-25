/**
 * @fileoverview Service for managing webhooks in Satoshi Showdown.
 * Handles the lifecycle of webhooks including creation, processing, and deletion.
 * Interacts with the BlockCypher API for blockchain event monitoring and manages local
 * database records for webhooks. This service is integral to the platform's event-driven
 * architecture, particularly for monitoring blockchain transactions.
 *
 * @module services/webhookService
 * @requires models/webhookModel - Data model for webhooks.
 * @requires services/transactionService - For updating transaction records.
 * @requires services/walletService - For managing wallet operations.
 * @requires utils/apiUtil - For making external API requests.
 * @requires utils/errorUtil - For custom error handling.
 * @requires utils/logUtil - For application-wide logging.
 */

const Webhook = require("../models/webhookModel");
const { createUTXO } = require("./utxoService");
const { updateTransactionById } = require("./transactionService");
const { updateWalletBalanceById, addUTXOToWallet } = require("./walletService");
const { postAPI, deleteAPI } = require("../utils/apiUtil");
const { NotFoundError } = require("../utils/errorUtil");
const log = require("../utils/logUtil");

// Configuration for external API interaction
const apiBaseUrl = process.env.BLOCKCYPHER_BASE_URL;
const apiToken = process.env.BLOCKCYPHER_TOKEN;

/**
 * Creates a new webhook in the Satoshi Showdown application and registers it with BlockCypher.
 * This webhook monitors blockchain events for a specific address and tracks transaction confirmations.
 *
 * @async
 * @param {string} address - The blockchain address to monitor.
 * @param {string} transactionRef - The reference ID of the associated transaction.
 * @return {Promise<Object>} A promise resolving to the newly created webhook object.
 * @throws {Error} If an error occurs during webhook creation or registration.
 */
const createWebhook = async (
  monitoredAddress,
  walletRef,
  transactionRef,
  userRef,
  eventRef,
) => {
  // Define the new webhook and save it in the database
  const newWebhook = new Webhook({
    monitoredAddress,
    type: "tx-confirmation",
    transactionRef,
    walletRef,
    userRef,
    eventRef,
  });
  await newWebhook.save();

  // Register the webhook with BlockCypher
  const callbackUrl = `${process.env.WEBHOOK_DOMAIN}/webhook/receive/${newWebhook.urlId}`;
  const webhookData = {
    event: "tx-confirmation",
    address: monitoredAddress,
    url: callbackUrl,
    confirmations: 6,
    token: apiToken,
  };
  const response = await postAPI(
    `${apiBaseUrl}/hooks?token=${apiToken}`,
    webhookData,
  );

  // Update the local webhook record with the response
  await Webhook.findByIdAndUpdate(newWebhook._id, { response });
  log.debug(`Webhook created: ${JSON.stringify(response, null, 2)}`);
  return newWebhook;
};

/**
 * Processes a received webhook by updating its status and associated transaction and wallet records.
 * Efficiently handles the headers, body, and confirmation status of the incoming webhook data.
 *
 * @async
 * @param {string} urlId - The unique identifier of the webhook.
 * @param {Object} headers - The HTTP headers of the incoming webhook request.
 * @param {Object} data - The JSON payload of the webhook request.
 * @throws {NotFoundError} If the webhook with the specified URL ID is not found.
 */
const processWebhook = async (urlId, headers, data) => {
  console.log(data);

  let webhook = await _getWebhook(urlId);

  // Update webhook with received data and process its status
  const updateData = {
    headers,
    body: data,
    ...(await _processWebhookStatus(webhook, data.confirmations)),
  };
  webhook = await _updateWebhook(urlId, updateData);

  // Process transaction and wallet updates based on webhook data
  const { transactionUpdate, walletUpdate } =
    await _processWebhookTransactionData(webhook);

  const transaction = await updateTransactionById(
    webhook.transactionRef,
    transactionUpdate,
  );

  const wallet = await updateWalletBalanceById(webhook.walletRef, walletUpdate);

  log.info(
    `Webhook processed: Transaction - ${transaction._id}, Wallet - ${wallet._id}`,
  );
};

/**
 * Retrieves a specific webhook by its URL identifier from the database.
 * This function is internal to the service and not exposed externally.
 *
 * @async
 * @private
 * @param {string} urlId - The URL identifier of the webhook.
 * @return {Promise<Object>} The retrieved webhook object.
 * @throws {NotFoundError} If the webhook with the specified URL ID is not found.
 */
const _getWebhook = async (urlId) => {
  const webhook = await Webhook.findOne({ urlId });
  if (!webhook)
    throw new NotFoundError(`Webhook with URL ID ${urlId} not found`);
  return webhook;
};

/**
 * Updates the status of a webhook based on the current confirmation count.
 * Tracks each confirmation update and marks the webhook as 'processing' or 'success' as appropriate.
 *
 * @async
 * @private
 * @param {Webhook} webhook - The webhook document being processed.
 * @param {number} currentConfirmations - The latest count of confirmations for the transaction.
 * @return {Object} An object with updates for the webhook's status and confirmations.
 * @throws {Error} If there is an issue with processing the webhook status.
 */
const _processWebhookStatus = async (webhook, currentConfirmations) => {
  const statusUpdate = {
    status: webhook.status,
    lastProcessedConfirmation: webhook.currentConfirmation,
    currentConfirmation: currentConfirmations,
    confirmationsReceived: [...webhook.confirmationsReceived],
  };

  if (webhook.status === "pending") statusUpdate.status = "processing";
  statusUpdate.confirmationsReceived[currentConfirmations] = {
    confirmationNumber: currentConfirmations,
    timestamp: new Date(),
  };

  if (currentConfirmations === 6) {
    statusUpdate.status = "success";

    // Delete the webhook from BlockCypher
    await _deleteWebhook(webhook.response.id, webhook._id);
  }

  return statusUpdate;
};

/**
 * Prepares the transaction and wallet update data based on the transaction details from the webhook body.
 * Calculates the amount involved for the monitored address and determines the necessary updates.
 *
 * @async
 * @private
 * @param {Webhook} webhook - The webhook document containing response data.
 * @return {Object} An object containing updates for the transaction and wallet.
 * @throws {Error} Thrown if there is an issue in processing the transaction or wallet update data.
 * @note This function does not directly update the database but prepares data for subsequent updates.
 */
const _processWebhookTransactionData = async (webhook) => {
  const transactionDetails = webhook.body;
  const monitoredAddress = webhook.response.address;

  const amountInvolved = transactionDetails.outputs.reduce((sum, output) => {
    return output.addresses.includes(monitoredAddress)
      ? sum + output.value
      : sum;
  }, 0);

  if (amountInvolved > 0) {
    // Create UTXO records only for the first confirmation
    if (transactionDetails.confirmations === 1) {
      const utxoPromises = transactionDetails.outputs
        .map((output, index) => ({
          output,
          index,
        }))
        .filter(({ output }) => output.addresses.includes(monitoredAddress))
        .map(async ({ output, index }) => {
          const utxo = await createUTXO({
            userRef: webhook.userRef,
            eventRef: webhook.eventRef,
            transactionHash: transactionDetails.hash,
            outputIndex: index,
            amount: output.value,
            address: monitoredAddress,
            scriptPubKey: output.script,
            scriptType: output.script_type,
            blockHeight: transactionDetails.block_height,
            timestamp: new Date(transactionDetails.received),
          });

          // Add the UTXO to the corresponding wallet
          await addUTXOToWallet(webhook.walletRef, utxo._id);
          webhook.utxoRef = utxo._id;
          await webhook.save();
          return utxo;
        });

      try {
        await Promise.all(utxoPromises);
      } catch (error) {
        log.error("Error creating UTXOs:", error);
      }
    }

    // Determine transaction status based on confirmation count
    const isConfirmed = transactionDetails.confirmations >= 6;
    const transactionStatus = isConfirmed ? "completed" : "confirming";

    // Prepare transaction update data
    const transactionUpdate = {
      confirmations: transactionDetails.confirmations,
      status: transactionStatus,
      confirmedAmount: isConfirmed ? amountInvolved : 0,
      unconfirmedAmount: !isConfirmed ? amountInvolved : 0,
    };

    // Prepare wallet update data
    const walletUpdate = {
      confirmedBalance: isConfirmed ? amountInvolved : 0,
      unconfirmedBalance: !isConfirmed ? amountInvolved : 0,
    };

    return { transactionUpdate, walletUpdate };
  } else {
    log.info(
      `No transaction amount for monitored address: ${monitoredAddress}`,
    );
    return { transactionUpdate: null, walletUpdate: null };
  }
};

/**
 * Updates the database record of a specific webhook with new data.
 * Primarily used to update the status and data payload of a webhook.
 *
 * @async
 * @private
 * @param {string} urlId - The unique identifier of the webhook.
 * @param {Object} updateData - New data for updating the webhook.
 * @return {Promise<Object>} A promise resolving to the updated webhook object.
 * @throws {NotFoundError} If the webhook with the specified URL ID is not found.
 */
const _updateWebhook = async (urlId, updateData) => {
  const updatedWebhook = await Webhook.findOneAndUpdate({ urlId }, updateData, {
    new: true,
  });
  if (!updatedWebhook)
    throw new NotFoundError(
      `Webhook with URL ID ${urlId} not found for update`,
    );
  return updatedWebhook;
};

/**
 * Soft deletes a webhook in the database and removes its registration with BlockCypher.
 * This is a cleanup operation performed when a webhook is no longer needed.
 *
 * @async
 * @private
 * @param {string} blockcypherId - The Blockcypher ID of the webhook to delete.
 * @param {string} webhookId - The ID of the webhook to delete.
 * @throws {Error} If there's an issue with the deletion process.
 */
const _deleteWebhook = async (blockcypherId, webhookId) => {
  // URL for the DELETE request to BlockCypher API
  const deleteUrl = `${apiBaseUrl}/hooks/${blockcypherId}?token=${apiToken}`;

  // Make the DELETE request to BlockCypher
  await deleteAPI(deleteUrl);

  // Additionally, soft delete the webhook record from the local database
  await Webhook.findByIdAndUpdate(webhookId, { isDeleted: true });
  log.info(`Webhook with ID ${blockcypherId} soft deleted.`);
};

module.exports = {
  createWebhook,
  processWebhook,
};
