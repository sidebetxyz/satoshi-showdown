// webhookModel.js
/**
 * Webhook Model for Satoshi Showdown
 *
 * Manages webhooks for real-time monitoring of blockchain events, essential for updates within the platform.
 * Each webhook corresponds to a specific event or transaction and includes a unique URL identifier for targeted callbacks.
 */

const mongoose = require('mongoose');

const webhookSchema = new mongoose.Schema({
  urlId: { type: String, required: true }, // Unique identifier for callback URL
  method: {
    type: String,
    enum: ['GET', 'POST', 'PUT', 'DELETE'],
    default: 'POST'
  },
  headers: Map, // HTTP headers to be sent with the webhook request
  body: mongoose.Schema.Types.Mixed, // Payload of the webhook request

  // Associations with event and transaction
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  transaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction',
    required: true
  },

  // Status tracking for the webhook
  status: {
    type: String,
    enum: ['pending', 'success', 'failed'],
    default: 'pending'
  },
  lastAttempt: Date, // Timestamp of the last attempt to send the webhook
  response: { statusCode: Number, body: mongoose.Schema.Types.Mixed }, // Response received from the webhook callback
});

const Webhook = mongoose.model('Webhook', webhookSchema);
module.exports = Webhook;
