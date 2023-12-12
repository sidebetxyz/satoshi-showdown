/**
 * @fileoverview Transaction Model for Satoshi Showdown.
 * Manages cryptocurrency transactions, tracking amounts, status, and confirmations.
 */

const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

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
    status: {
      type: String,
      enum: ["pending", "confirming", "completed", "failed"],
      default: "pending",
    },
    confirmations: { type: Number, default: null },
    transactionHash: { type: String },
  },
  { timestamps: true },
);

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
