/**
 * @fileoverview Service for managing transactions in Satoshi Showdown.
 * Handles creating, updating, retrieving, and deleting transaction records,
 * ensuring data integrity and consistency.
 *
 * @module services/transactionService
 * @requires models/transactionModel - Transaction data model.
 * @requires bitcoinjs-lib - Library for Bitcoin transaction handling.
 * @requires utils/errorUtil - Custom error classes and error handling utilities.
 * @requires utils/logUtil - Logging utility for application-wide logging.
 */

const Transaction = require("../models/transactionModel");
const bitcoin = require("bitcoinjs-lib");
const network = bitcoin.networks.testnet; // or bitcoin.networks.bitcoin for mainnet
const { NotFoundError } = require("../utils/errorUtil");
const log = require("../utils/logUtil");

/**
 * Creates a new transaction record in the database.
 *
 * @async
 * @param {Object} transactionData - The data for the new transaction.
 * @param {string} transactionData.userRef - ID of the user associated with the transaction.
 * @param {string} transactionData.walletRef - ID of the wallet associated with the transaction.
 * @param {string} transactionData.transactionType - The type of the transaction (e.g., "incoming", "outgoing").
 * @param {number} transactionData.expectedAmount - The expected amount of the transaction in satoshis.
 * @param {string} transactionData.walletAddress - The wallet address involved in the transaction.
 * @param {string} transactionData.userAddress - The user's address involved in the transaction.
 * @return {Promise<Object>} A promise that resolves to the created transaction object.
 * @throws {Error} If an error occurs during the creation of the transaction record in the database.
 */
const createTransactionRecord = async (transactionData) => {
  try {
    const transaction = new Transaction(transactionData);
    await transaction.save();
    log.info(`Transaction record created with ID: ${transaction._id}`);
    return transaction;
  } catch (error) {
    throw new Error(`Error creating transaction record: ${error.message}`);
  }
};

/**
 * Creates a raw Bitcoin transaction.
 *
 * @param {Object} details - Details for the raw Bitcoin transaction.
 * @param {Array} details.utxos - Unspent transaction outputs to be used.
 * @param {string} details.recipientAddress - The recipient's Bitcoin address.
 * @param {number} details.amount - Amount to send in satoshis.
 * @return {string} The raw Bitcoin transaction in hex format.
 */
const createRawBitcoinTransaction = ({ utxos, recipientAddress, amount }) => {
  const tx = new bitcoin.TransactionBuilder(network);
  utxos.forEach((utxo) => tx.addInput(utxo.txId, utxo.vout));
  tx.addOutput(recipientAddress, amount);
  // Further implementation...
  return tx.buildIncomplete().toHex();
};

/**
 * Retrieves a specific transaction record by its ID.
 *
 * @async
 * @param {string} transactionId - ID of the transaction to retrieve.
 * @return {Promise<Object>} The found transaction object.
 * @throws {NotFoundError} Throws an error if the transaction is not found.
 */
const getTransactionRecord = async (transactionId) => {
  const transaction = await Transaction.findOne({ transactionId });
  if (!transaction) {
    throw new NotFoundError(`Transaction with ID ${transactionId} not found`);
  }
  return transaction;
};

/**
 * Retrieves all transaction records from the database.
 *
 * @async
 * @return {Promise<Array>} An array of all transaction objects.
 */
const getAllTransactionRecords = async () => {
  return await Transaction.find({});
};

/**
 * Updates an existing transaction record in the database.
 * This function first retrieves the existing transaction record to compare with the provided update data.
 * It then applies updates only for fields that have changed, optimizing database operations
 * and maintaining data integrity. If there are no changes, it skips the update.
 *
 * @async
 * @function updateTransactionRecord
 * @param {string} transactionId - The unique identifier of the transaction to update.
 * @param {Object} updateData - An object containing the new data for the transaction.
 * @return {Promise<Object>} A promise that resolves to the updated transaction object.
 * @throws {NotFoundError} Thrown if the transaction with the specified ID is not found in the database.
 * @throws {Error} Thrown if there is an error during the update process.
 */
const updateTransactionRecord = async (transactionId, updateData) => {
  try {
    // Retrieve the existing transaction to compare with the new update data
    const existingTransaction = await Transaction.findById(transactionId);
    if (!existingTransaction) {
      throw new NotFoundError(`Transaction with ID ${transactionId} not found`);
    }

    // Check for changes in the update data and apply only the changes
    let hasChanges = false;
    const updatesToApply = {};

    for (const key in updateData) {
      if (updateData[key] !== existingTransaction[key]) {
        updatesToApply[key] = updateData[key];
        hasChanges = true;
      }
    }

    // If there are changes, apply them; otherwise, skip the update
    if (hasChanges) {
      const updatedTransaction = await Transaction.findByIdAndUpdate(
        transactionId,
        updatesToApply,
        { new: true },
      );
      log.info(`Transaction record with ID ${transactionId} updated`);
      return updatedTransaction;
    } else {
      log.info(`No changes to update for transaction with ID ${transactionId}`);
      return existingTransaction;
    }
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new Error(`Error updating transaction record: ${error.message}`);
  }
};

module.exports = {
  createTransactionRecord,
  createRawBitcoinTransaction,
  getTransactionRecord,
  getAllTransactionRecords,
  updateTransactionRecord,
};
