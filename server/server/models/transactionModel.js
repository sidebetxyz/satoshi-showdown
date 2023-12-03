// transactionModel.js
/**
 * Transaction Model
 *
 * Manages financial transactions on the Satoshi Showdown platform, particularly focusing
 * on cryptocurrency-based transactions. This model ensures the integrity and security of
 * transactions by tracking amounts, status, and blockchain confirmations.
 */

const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  // Transaction details
  transactionId: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  expectedAmount: { type: Number, required: true },
  receivedAmount: { type: Number, default: 0 },
  address: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: "pending",
  },
  confirmations: { type: Number, default: 0 },
  confidenceFactor: { type: Number, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

transactionSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const Transaction = mongoose.model("Transaction", transactionSchema);
module.exports = Transaction;