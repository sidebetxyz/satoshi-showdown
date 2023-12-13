/**
 * @fileoverview Transaction Model for Satoshi Showdown.
 * This model defines the structure and constraints for handling cryptocurrency transactions
 * within the platform. It is essential for managing and tracking the details of transactions,
 * such as transaction types, amounts, status, confirmations, and associated references to users
 * and wallets. The model plays a critical role in ensuring accurate and secure transaction processing
 * and record-keeping for financial activities on the platform.
 *
 * @module models/Transaction
 * @requires mongoose - Mongoose library for MongoDB object modeling, providing schema definition and data validation.
 * @requires uuid - UUID library for generating unique identifiers, used for creating distinct transaction IDs.
 */

const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

/**
 * Schema definition for the Transaction model.
 * Specifies the structure, data types, and validation rules for fields associated with a cryptocurrency transaction.
 * Fields include transaction identifiers, references to related user and wallet, transaction type, amounts,
 * status, and other relevant transaction data. This schema is designed to comprehensively capture all
 * necessary details for transaction management and auditing within the platform.
 *
 * @typedef {Object} TransactionSchema
 * @property {string} transactionId - Unique identifier for the transaction.
 * @property {mongoose.Schema.Types.ObjectId} userRef - Reference to the User model for transaction association.
 * @property {mongoose.Schema.Types.ObjectId} walletRef - Reference to the Wallet model for transaction association.
 * @property {string} transactionType - Enum to represent the direction of the transaction.
 * @property {number} expectedAmount - Expected amount of the transaction.
 * @property {number} receivedAmount - Actual received amount (useful for incoming transactions).
 * @property {string} walletAddress - Address of the wallet involved in the transaction.
 * @property {string} userAddress - Address of the user involved in the transaction.
 * @property {number} unconfirmedAmount - Amount pending confirmation.
 * @property {number} confirmedAmount - Amount confirmed in the transaction.
 * @property {string} status - Current status of the transaction.
 * @property {number} confirmations - Number of network confirmations for the transaction.
 * @property {string} transactionHash - Hash of the transaction as recorded on the blockchain.
 *
 * @type {mongoose.Schema}
 */
const transactionSchema = new mongoose.Schema(
  {
    transactionId: { type: String, default: uuidv4, unique: true },
    userRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    walletRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wallet",
      required: true,
    },
    transactionType: {
      type: String,
      enum: ["incoming", "outgoing"],
      required: true,
    },
    expectedAmount: { type: Number, required: true },
    receivedAmount: { type: Number, default: null },
    walletAddress: { type: String, required: true },
    userAddress: { type: String, required: true },
    unconfirmedAmount: { type: Number, default: null },
    confirmedAmount: { type: Number, default: null },
    status: {
      type: String,
      enum: ["pending", "mempool", "confirming", "completed", "failed"],
      default: "pending",
    },
    confirmations: { type: Number, default: null },
    transactionHash: { type: String },
  },
  { timestamps: true },
);

/**
 * Transaction model based on the defined schema.
 * Represents a cryptocurrency transaction within the Satoshi Showdown platform, encapsulating
 * all data and behavior related to financial transactions, including tracking, processing,
 * and verification of cryptocurrency movements.
 *
 * @typedef {mongoose.Model<module:models/Transaction~TransactionSchema>} TransactionModel
 */

/**
 * @type {TransactionModel}
 */
const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
