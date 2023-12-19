/**
 * @fileoverview Webhook Model for Satoshi Showdown.
 * This model is pivotal for tracking and managing blockchain event webhooks within the platform.
 * It enables real-time monitoring and updates related to blockchain transactions and significant events,
 * thus playing a crucial role in timely and accurate event handling. The model includes fields for webhook
 * configuration, response data, type, associated transactions, status, confirmation tracking, and lifecycle management.
 *
 * @module models/Webhook
 * @requires mongoose - Mongoose library for MongoDB object modeling.
 * @requires uuid - UUID library for generating unique webhook identifiers.
 */

const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

/**
 * WebhookSchema: Defines the structure and rules for blockchain event webhook data.
 * Includes fields for unique identifier, response data, headers, body, type, related transaction, status,
 * confirmation tracking, and lifecycle information. This schema ensures comprehensive management of webhooks.
 *
 * @typedef {Object} WebhookSchema
 * @property {string} urlId - Unique identifier for the webhook.
 * @property {Object} response - Response data received from the external service.
 * @property {Map} headers - HTTP headers associated with the webhook request.
 * @property {*} body - Webhook payload, flexible in data type.
 * @property {string} type - Type of webhook, e.g., transaction confirmation.
 * @property {mongoose.Schema.Types.ObjectId} transactionRef - Reference to associated Transaction model.
 * @property {string} status - Current status of the webhook (pending, processing, success, failed).
 * @property {Object[]} confirmationsReceived - Array of objects, each tracking a received confirmation number along with its timestamp.
 * @property {number} lastProcessedConfirmation - Last processed confirmation count.
 * @property {number} currentConfirmation - Current confirmation count.
 * @property {boolean} isDeleted - Indicates if the webhook is soft deleted.
 * @property {Date} deletedAt - Timestamp of webhook soft deletion.
 * @property {Date} lastAttempt - Timestamp of the last processing attempt.
 *
 * @type {mongoose.Schema}
 */
const webhookSchema = new mongoose.Schema(
  {
    urlId: { type: String, default: uuidv4, unique: true },
    response: Object,
    headers: Map,
    body: mongoose.Schema.Types.Mixed,
    type: {
      type: String,
      enum: ["tx-confirmation"],
      required: true,
    },
    transactionRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "success", "failed"],
      default: "pending",
    },
    confirmationsReceived: [
      {
        confirmationNumber: Number,
        timestamp: { type: Date, default: Date.now },
      },
    ],
    lastProcessedConfirmation: { type: Number, default: null },
    currentConfirmation: { type: Number, default: null },
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date,
    lastAttempt: Date,
  },
  { timestamps: true },
);

/**
 * Marks the webhook as deleted (soft delete) without removing it from the database.
 * Maintains records for audits while preventing further processing.
 *
 * @function softDelete
 * @memberof WebhookSchema
 * @instance
 * @async
 * @return {Promise<WebhookSchema>} The updated webhook object marked as deleted.
 */
webhookSchema.methods.softDelete = async function () {
  this.isDeleted = true;
  this.deletedAt = new Date();
  await this.save();
  return this;
};

/**
 * WebhookModel: Represents a blockchain event webhook in Satoshi Showdown.
 * Encapsulates configuration, status, transaction association, and lifecycle management.
 * Essential for asynchronous event integration and notifications from blockchain services.
 *
 * @typedef {mongoose.Model<WebhookSchema>} WebhookModel
 */
const Webhook = mongoose.model("Webhook", webhookSchema);

module.exports = Webhook;
