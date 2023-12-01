const mongoose = require("mongoose");

/**
 * Transaction Model
 *
 * Manages financial transactions on the Satoshi Showdown platform, particularly focusing
 * on cryptocurrency-based transactions. This model ensures the integrity and security of
 * transactions by tracking amounts, status, and blockchain confirmations.
 */
const transactionSchema = new mongoose.Schema({
  // Unique identifier for the transaction within the system
  transactionId: {
    type: String,
    required: true,
    unique: true,
  },

  // Related user information for transaction tracking
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  // The expected monetary amount for the transaction
  expectedAmount: {
    type: Number,
    required: true,
  },

  // The actual received amount, which may differ from the expected amount
  receivedAmount: {
    type: Number,
    default: 0,
  },

  // Cryptocurrency address associated with the transaction
  address: {
    type: String,
    required: true,
  },

  // Transaction status to track its lifecycle (e.g., pending, completed)
  status: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending",
  },

  // Number of confirmations from the blockchain, indicating transaction security
  confirmations: {
    type: Number,
    default: 0,
  },

  // Optional confidence factor from services like BlockCypher for risk assessment
  confidenceFactor: {
    type: Number,
    default: null,
  },

  // Timestamps for transaction creation and updates
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure updatedAt field is modified on document updates
transactionSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Compile the schema into a model
const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
