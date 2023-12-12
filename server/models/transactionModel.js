/**
 * @fileoverview Transaction Model for Satoshi Showdown.
 * Manages cryptocurrency transactions, tracking amounts, status, and confirmations.
 */

const mongoose = require("mongoose");
const { v4: uuidv4 } = require('uuid');

const transactionSchema = new mongoose.Schema({
  transactionId: { type: String, default: uuidv4, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  walletId: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet', required: true },
  transactionType: {
    type: String,
    enum: ['incoming', 'outgoing'],
    required: true
  },
  amount: { type: Number, required: true },
  address: { type: String, required: true }, // Address for incoming or outgoing transaction
  status: {
    type: String,
    enum: ["pending", "confirming", "completed", "failed"],
    default: "pending",
  },
  confirmations: { type: Number, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  // Additional fields for outgoing transactions
  recipientAddress: { type: String }, // Optional, used for outgoing transactions
  transactionHash: { type: String }, // Optional, hash of the blockchain transaction
});

transactionSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const Transaction = mongoose.model("Transaction", transactionSchema);
module.exports = Transaction;
