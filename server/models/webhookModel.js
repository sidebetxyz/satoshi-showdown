/**
 * @fileoverview Webhook Model for Satoshi Showdown.
 * Manages blockchain event webhooks for real-time monitoring and updates.
 */

const mongoose = require('mongoose');

const webhookSchema = new mongoose.Schema({
  urlId: { type: String, required: true },
  method: {
    type: String,
    enum: ['GET', 'POST', 'PUT', 'DELETE'],
    default: 'POST'
  },
  headers: Map,
  body: mongoose.Schema.Types.Mixed,
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  transaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed'],
    default: 'pending'
  },
  lastAttempt: Date,
  response: Object,
});

const Webhook = mongoose.model('Webhook', webhookSchema);
module.exports = Webhook;
