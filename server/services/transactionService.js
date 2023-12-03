const Transaction = require('../models/transactionModel');
const { NotFoundError } = require('../utils/errorUtil');
const { v4: uuidv4 } = require('uuid');

// Service for managing transactions
const TransactionService = {
    // Create a new transaction
    async createTransaction({ eventId, userId, expectedAmount, address }) {
        const transactionId = uuidv4();
        const transaction = new Transaction({
            transactionId,
            event: eventId,
            userId,
            expectedAmount,
            address,
            status: "pending"
        });
        await transaction.save();
        return transaction;
    },

    // Update an existing transaction
    async updateTransaction(transactionId, updateData) {
        const transaction = await Transaction.findById(transactionId);
        if (!transaction) {
            throw new NotFoundError(`Transaction with ID ${transactionId} not found`);
        }
        Object.assign(transaction, updateData);
        await transaction.save();
        return transaction;
    },

    // Additional methods for transaction management can be added here
};

module.exports = TransactionService;
