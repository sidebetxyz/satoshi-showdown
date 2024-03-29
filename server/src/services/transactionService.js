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
 * Creates a refund transaction record.
 * @param {Object} refundData - Data for the refund transaction.
 * @return {Promise<Object>} The created refund transaction record.
 */
const createRefundTransactionRecord = async (refundData) => {
  try {
    const refundTransaction = new Transaction({
      ...refundData,
    });
    await refundTransaction.save();
    log.info(`Refund transaction record created: ${refundTransaction._id}`);
    return refundTransaction;
  } catch (error) {
    log.error(`Error creating refund transaction record: ${error.message}`);
    throw error;
  }
};

/**
 * Retrieves a specific transaction record by its ID.
 *
 * @async
 * @param {string} transactionId - The MongoDB reference ID of the transaction to retrieve.
 * @return {Promise<Object>} The found transaction object.
 * @throws {NotFoundError} Throws an error if the transaction is not found.
 */
const getTransactionRecordById = async (transactionId) => {
  const transaction = await Transaction.findById(transactionId);
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
 * Updates an existing transaction record in the database by its MongoDB reference ID.
 * This function retrieves the existing transaction record, compares it with the provided update data,
 * and applies updates only for fields that have changed. This optimizes database operations
 * and maintains data integrity. If there are no changes, the update is skipped.
 *
 * @async
 * @function updateTransactionById
 * @param {string} transactionId - The MongoDB reference ID of the transaction to update.
 * @param {Object} updateData - An object containing the new data for the transaction.
 * @return {Promise<Object>} A promise that resolves to the updated transaction object.
 * @throws {NotFoundError} Thrown if the transaction with the specified ID is not found in the database.
 * @throws {Error} Thrown if there is an error during the update process.
 */
const updateTransactionById = async (transactionId, updateData) => {
  try {
    const existingTransaction = await Transaction.findById(transactionId);
    if (!existingTransaction) {
      throw new NotFoundError(`Transaction with ID ${transactionId} not found`);
    }

    let hasChanges = false;
    const updatesToApply = {};

    for (const key in updateData) {
      if (updateData[key] !== existingTransaction[key]) {
        updatesToApply[key] = updateData[key];
        hasChanges = true;
      }
    }

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
  createRefundTransactionRecord,
  getTransactionRecordById,
  getAllTransactionRecords,
  updateTransactionById,
};
