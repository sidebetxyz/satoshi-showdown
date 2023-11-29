import TransactionModel from "../models/transactionModel.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Service for handling transactions.
 * This service encapsulates the logic for creating and managing
 * transactions, particularly for handling Bitcoin transactions.
 */
export class TransactionService {
  constructor() {
    // Initialization code if needed
  }

  /**
   * Creates a new transaction in the system.
   * This method handles the creation and storage of transaction data.
   *
   * @param {string} walletId - The ID of the wallet involved in the transaction.
   * @param {string} address - The Bitcoin address for the transaction.
   * @param {number} amount - The amount of Bitcoin to transact.
   * @returns {Promise<Object>} The newly created transaction object.
   */
  async createTransaction(walletId, address, amount) {
    try {
      // Generate a unique identifier for the transaction
      const uniqueId = uuidv4();

      // Create a new transaction model instance
      const newTransaction = new TransactionModel({
        uniqueId,
        wallet: walletId,
        address,
        transactionInfo: { amount },
        status: "waiting",
      });

      // Save the transaction to the database
      await newTransaction.save();

      // Return the saved transaction
      return newTransaction;
    } catch (error) {
      // Log and rethrow any errors encountered
      console.error("Error creating transaction:", error);
      throw error;
    }
  }

  /**
   * Retrieves a transaction by its unique identifier.
   *
   * @param {string} transactionId - The unique identifier of the transaction.
   * @returns {Promise<Object>} The transaction object if found.
   */
  async getTransactionById(transactionId) {
    // Fetch and return the transaction from the database
    return await TransactionModel.findById(transactionId);
  }

  // Additional transaction-related methods can be implemented here
}

export default TransactionService;
