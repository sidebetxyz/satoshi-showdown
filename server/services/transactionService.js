import TransactionModel from "../models/transactionModel.js";
import { v4 as uuidv4 } from "uuid";

/**
 * TransactionService for handling blockchain transactions.
 * It includes functionalities like creating new transactions and retrieving transaction details.
 */
export class TransactionService {
  constructor() {
    // Initialization logic if necessary
  }

  /**
   * Creates and stores a new transaction in the database.
   * @param {string} walletId - ID of the wallet associated with the transaction.
   * @param {string} address - Blockchain address for the transaction.
   * @param {number} amount - Amount involved in the transaction.
   * @returns {Promise<Object>} Newly created transaction data.
   */
  async createTransaction(walletId, address, amount) {
    const uniqueId = uuidv4(); // Generate a unique identifier
    const newTransaction = new TransactionModel({
      uniqueId,
      wallet: walletId,
      address,
      transactionInfo: { amount },
      status: "waiting",
    });
    await newTransaction.save(); // Save transaction to the database
    return newTransaction; // Return created transaction
  }

  /**
   * Retrieves a transaction by its ID.
   * @param {string} transactionId - ID of the transaction to retrieve.
   * @returns {Promise<Object>} Transaction data if found.
   */
  async getTransactionById(transactionId) {
    return await TransactionModel.findById(transactionId); // Fetch transaction from the database
  }

  // Additional methods for handling transactions can be added here
}

export default TransactionService;
