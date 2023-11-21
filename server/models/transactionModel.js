const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  wallet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Wallet",
    required: true,
  },
  address: { type: String, required: true },
  transactionStatus: {
    type: String,
    enum: ["waiting", "processing", "complete", "canceled"],
    default: "waiting",
  },
  transactionInfo: {
    amount: Number,
    hash: String,
  },
  confirmations: {
    type: Number,
    default: 0, // Start with 0 confirmations
  },
  webhook: { type: mongoose.Schema.Types.ObjectId, ref: "Webhook" },
  timestamp: { type: Date, default: Date.now },
});

const Transaction = mongoose.model("Transaction", transactionSchema);
module.exports = Transaction;
