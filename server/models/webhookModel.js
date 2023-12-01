const mongoose = require("mongoose");

/**
 * Webhook Model
 *
 * Manages webhooks within the application, linking them directly to specific transactions and events.
 * This model ensures that webhooks are effectively used to monitor and respond to transaction
 * and event updates, enhancing the real-time capabilities of the platform.
 */

const webhookSchema = new mongoose.Schema({
  // Webhook endpoint and request details
  url: { type: String, required: true },
  method: {
    type: String,
    enum: ["GET", "POST", "PUT", "DELETE"],
    default: "POST",
  },
  headers: Map,
  body: mongoose.Schema.Types.Mixed,

  // Direct association with the Event model
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },

  // Direct association with the Transaction model
  transaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Transaction",
    required: true,
  },

  // Tracking the status and response of the webhook
  status: {
    type: String,
    enum: ["pending", "success", "failed"],
    default: "pending",
  },
  lastAttempt: Date,
  response: {
    statusCode: Number,
    body: mongoose.Schema.Types.Mixed,
  },
});

const Webhook = mongoose.model("Webhook", webhookSchema);

module.exports = Webhook;
