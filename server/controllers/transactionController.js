const TransactionService = require('../services/transactionService');

const TransactionController = {
    async createTransaction(req, res, next) {
        try {
            const transactionData = req.body;
            const transaction = await TransactionService.createTransaction(transactionData);
            res.status(201).json(transaction);
        } catch (error) {
            next(error);
        }
    },

    // Other methods for updating, retrieving transactions...
};

module.exports = TransactionController;
