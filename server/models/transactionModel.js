const mongoose = require("mongoose");

// Schema to manage blockchain transactions.
const transactionSchema = new mongoose.Schema({
  uniqueId: { type: String, required: true, unique: true }, // Unique identifier for the transaction.
  wallet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Wallet",
    required: true,
  },
  address: { type: String, required: true }, // Blockchain address involved in the transaction.
  status: {
    // Status of the transaction (waiting, processing, etc.).
    type: String,
    enum: ["waiting", "processing", "confirming", "complete", "canceled"],
    default: "waiting",
  },
  transactionInfo: {
    // Details about the transaction like amount and hash.
    amount: Number,
    hash: String,
  },
  confirmations: {
    // Number of confirmations received for the transaction.
    type: Number,
    default: null,
  },
  timestamp: { type: Date, default: Date.now }, // Timestamp of when the transaction was created.
});

const Transaction = mongoose.model("Transaction", transactionSchema);
module.exports = Transaction;
