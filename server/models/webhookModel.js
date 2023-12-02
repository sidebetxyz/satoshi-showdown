// webhookModel.js
/**
 * Webhook Model
 *
 * Manages webhooks linked to transactions and events, essential for real-time
 * monitoring and updates within the Satoshi Showdown platform.
 */

const mongoose = require("mongoose");

const webhookSchema = new mongoose.Schema({
  // Webhook details
  url: { type: String, required: true },
  method: {
    type: String,
    enum: ["GET", "POST", "PUT", "DELETE"],
    default: "POST",
  },
  headers: Map,
  body: mongoose.Schema.Types.Mixed,

  // Associations
  event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  transaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Transaction",
    required: true,
  },

  // Status tracking
  status: {
    type: String,
    enum: ["pending", "success", "failed"],
    default: "pending",
  },
  lastAttempt: Date,
  response: { statusCode: Number, body: mongoose.Schema.Types.Mixed },
});

const Webhook = mongoose.model("Webhook", webhookSchema);
module.exports = Webhook;
