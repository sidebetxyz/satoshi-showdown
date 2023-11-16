const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: "Event" }, // Not required
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
    // Other relevant transaction details
  },
  timestamp: { type: Date, default: Date.now },
});

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
