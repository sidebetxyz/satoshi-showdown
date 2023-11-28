const TransactionModel = require("../models/transactionModel");
const { v4: uuidv4 } = require("uuid");

class TransactionService {
  // Method to create a new transaction
  async createTransaction(walletId, address, amount) {
    try {
      const uniqueId = uuidv4();
      const newTransaction = new TransactionModel({
        uniqueId,
        wallet: walletId,
        address,
        transactionInfo: { amount },
        status: "waiting",
      });

      await newTransaction.save();
      console.log("Transaction created:", newTransaction);
      return newTransaction;
    } catch (error) {
      console.error("Error creating transaction:", error);
      throw error;
    }
  }

  // Method to retrieve a transaction by ID
  async getTransactionById(transactionId) {
    return await TransactionModel.findById(transactionId);
  }
}

module.exports = TransactionService;
