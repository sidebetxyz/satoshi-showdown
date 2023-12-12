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
  type: {
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
  isDeleted: { type: Boolean, default: false },
  deletedAt: Date
}, { timestamps: true }); // Enable automatic timestamps

// Optional: Middleware for soft delete
webhookSchema.methods.softDelete = function () {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

const Webhook = mongoose.model('Webhook', webhookSchema);
module.exports = Webhook;
