/**
 * @fileoverview Service for managing transactions in Satoshi Showdown.
 * Handles creating, updating, retrieving, and deleting transaction records,
 * ensuring data integrity and consistency.
 */

const Transaction = require('../models/transactionModel');
const { NotFoundError } = require('../utils/errorUtil');

/**
 * Creates a new transaction record.
 * 
 * @param {Object} transactionData - Data for the new transaction.
 * @returns {Promise<Object>} The created transaction object.
 */
const createTransaction = async (transactionData) => {
    const transaction = new Transaction({ ...transactionData, status: 'pending' });
    await transaction.save();
    return transaction;
};

/**
 * Retrieves a specific transaction by its ID.
 * 
 * @param {string} transactionId - ID of the transaction to retrieve.
 * @returns {Promise<Object>} The found transaction object.
 */
const getTransaction = async (transactionId) => {
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
        throw new NotFoundError(`Transaction with ID ${transactionId} not found`);
    }
    return transaction;
};

/**
 * Retrieves all transactions from the database.
 * 
 * @returns {Promise<Array>} An array of all transaction objects.
 */
const getAllTransactions = async () => {
    return await Transaction.find({});
};

/**
 * Updates an existing transaction record.
 * 
 * @param {string} transactionId - ID of the transaction to update.
 * @param {Object} updateData - New data for the transaction.
 * @returns {Promise<Object>} The updated transaction object.
 */
const updateTransaction = async (transactionId, updateData) => {
    const transaction = await Transaction.findByIdAndUpdate(transactionId, updateData, { new: true });
    if (!transaction) {
        throw new NotFoundError(`Transaction with ID ${transactionId} not found`);
    }
    return transaction;
};

// Exporting the functions for use in other parts of the application
module.exports = {
    createTransaction,
    getTransaction,
    getAllTransactions,
    updateTransaction
};
