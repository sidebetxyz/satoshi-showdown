import mongoose from "mongoose";

// Schema for managing webhooks related to blockchain events
const webhookSchema = new mongoose.Schema({
  address: { type: String, required: true }, // Blockchain address linked to the webhook
  uniqueId: { type: String, required: true, unique: true }, // Unique identifier for the webhook
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event" }, // Event ID associated with the webhook
  transactionId: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction" }, // Transaction ID related to the webhook
  type: { type: String, required: true }, // Type of the webhook (e.g., 'tx-confirmation')
  status: {
    type: String,
    enum: ["pending", "processed", "error"],
    default: "pending",
  }, // Current status of the webhook
  receivedAt: { type: Date, default: Date.now }, // Timestamp when the webhook was received
  completedAt: Date, // Timestamp marking the completion of webhook processing
  errorDetails: String, // Additional details in case of any errors during processing
});

const Webhook = mongoose.model("Webhook", webhookSchema);
export default Webhook;
