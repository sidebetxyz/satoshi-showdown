const mongoose = require("mongoose");

const webhookSchema = new mongoose.Schema({
  uniqueId: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
  transactionId: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction" },
  walletId: { type: mongoose.Schema.Types.ObjectId, ref: "Wallet" },
  type: { type: String, required: true }, // e.g., 'tx-confirmation'
  status: {
    type: String,
    enum: ["pending", "processed", "error"],
    default: "pending",
  },
  receivedAt: { type: Date, default: Date.now },
  processedAt: Date,
  errorDetails: String,
});

const Webhook = mongoose.model("Webhook", webhookSchema);
module.exports = Webhook;
