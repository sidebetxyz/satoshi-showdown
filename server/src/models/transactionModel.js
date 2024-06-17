/**
 * @fileoverview Transaction Model for Satoshi Showdown.
 * This model defines the structure and constraints for Transactions on the platform.
 *
 *
 * @module models/Transaction
 * @requires mongoose - Mongoose library for MongoDB object modeling, offering schema definition and data validation.
 * @requires uuid - UUID library for generating unique identifiers, utilized for creating distinct transaction IDs.
 */

const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

/**
 * Schema definition for the Transaction model.
 * Specifies the structure, data types, and validation rules for fields associated
 * with a cryptocurrency transaction. The schema captures essential transaction details
 * such as identifiers, references, type, amounts, status, confirmations, and blockchain
 * transaction hash.
 *
 * @typedef {Object} TransactionSchema
 * @property {string} transactionUUID - Unique identifier for the transaction.
 * @property {mongoose.Schema.Types.ObjectId} userRef - Reference to the User model.
 * @property {mongoose.Schema.Types.ObjectId} walletRef - Reference to the Wallet model.
 * @property {string} transactionType - Direction of the transaction (incoming/outgoing).
 * @property {string} purpose - The intended use of the transaction, categorized by type.
 * @property {string} walletAddress - Address of the wallet involved.
 * @property {string} userAddress - Address of the user involved.
 * @property {number} expectedAmount - Expected amount of the transaction.
 * @property {number} unconfirmedAmount - Amount pending confirmation.
 * @property {number} confirmedAmount - Amount confirmed in the transaction.
 * @property {string} status - Current status of the transaction.
 * @property {number} confirmations - Number of network confirmations.
 * @property {string} transactionHash - Blockchain hash of the transaction.
 *
 * @type {mongoose.Schema}
 */
const transactionSchema = new mongoose.Schema(
  {
    transactionUUID: { type: String, default: uuidv4, unique: true },
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
    purpose: {
      type: String,
      enum: [
        "entryFeePayment",
        "prizePoolFunding",
        "payFeeAndFundPool",
        "refundUser",
        "winnerPayout",
      ],
      required: true,
    },
    walletAddresses: [{ type: String, required: true }], // Updated to handle multiple addresses
    userAddress: { type: String, required: true },
    expectedAmount: { type: Number, required: true },
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
  { timestamps: true }
);

/**
 * Transaction model based on the defined schema.
 * Represents a cryptocurrency transaction within the Satoshi Showdown platform,
 * encapsulating key data and processes related to financial transactions, such as tracking,
 * processing, and verification of cryptocurrency movements.
 *
 * @typedef {mongoose.Model<TransactionSchema>} TransactionModel
 */
const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
