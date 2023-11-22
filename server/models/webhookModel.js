const mongoose = require("mongoose");

// Schema for managing webhooks for transaction notifications.
const webhookSchema = new mongoose.Schema({
  uniqueId: { type: String, required: true, unique: true }, // Unique identifier for the webhook.
  address: { type: String, required: true }, // Blockchain address associated with the webhook.
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event" }, // Event associated with the webhook.
  transactionId: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction" }, // Transaction associated with the webhook.
  walletId: { type: mongoose.Schema.Types.ObjectId, ref: "Wallet" }, // Wallet associated with the webhook.
  type: { type: String, required: true }, // Type of the webhook (e.g., 'tx-confirmation').
  status: {
    // Status of the webhook (pending, processed, etc.).
    type: String,
    enum: ["pending", "processed", "error"],
    default: "pending",
  },
  receivedAt: { type: Date, default: Date.now }, // Timestamp of when the webhook was received.
  processedAt: Date, // Timestamp of when the webhook was processed.
  errorDetails: String, // Details of any errors during webhook processing.
});

const Webhook = mongoose.model("Webhook", webhookSchema);
module.exports = Webhook;
