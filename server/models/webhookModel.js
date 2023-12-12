/**
 * @fileoverview Webhook Model for Satoshi Showdown.
 * Manages blockchain event webhooks for real-time monitoring and updates.
 */

const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const webhookSchema = new mongoose.Schema({
  urlId: { type: String, default: uuidv4, unique: true },
  response: Object,
  headers: Map,
  body: mongoose.Schema.Types.Mixed,
  type: { // New field for webhook type
    type: String,
    enum: ['tx-confirmation'],
    required: true
  },
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
  isDeleted: { type: Boolean, default: false }, // New field to track soft deletes
  deletedAt: { type: Date } // Timestamp for when the record was soft-deleted
});

const Webhook = mongoose.model('Webhook', webhookSchema);
module.exports = Webhook;
