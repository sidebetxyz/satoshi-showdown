/**
 * @fileoverview Webhook Model for Satoshi Showdown.
 * This model defines the structure and constraints for managing and tracking blockchain event webhooks
 * within the platform. It facilitates real-time monitoring and updates related to blockchain transactions
 * and other significant events, playing a critical role in ensuring timely and accurate event handling.
 * The model includes fields for webhook configuration, response data, type, associated transactions,
 * and lifecycle information such as status and deletion flags.
 *
 * @module models/Webhook
 * @requires mongoose - Mongoose library for MongoDB object modeling, providing schema definition and data validation.
 * @requires uuid - UUID library for generating unique identifiers, utilized for creating distinct webhook IDs.
 */

const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

/**
 * Schema definition for the Webhook model.
 * Specifies the structure, data types, and validation rules for fields associated with a blockchain event webhook.
 * Fields include unique identifiers, response data, headers, body, webhook type, related transaction,
 * status, and deletion information. This schema is designed to comprehensively capture all necessary
 * details for webhook management and processing within the platform.
 *
 * @typedef {Object} WebhookSchema
 * @property {string} urlId - Unique identifier for the webhook.
 * @property {Object} response - Response data received from the external service.
 * @property {Map} headers - HTTP headers associated with the webhook request.
 * @property {*} body - Webhook payload, flexible in data type.
 * @property {string} type - Type of webhook, e.g., transaction confirmation.
 * @property {mongoose.Schema.Types.ObjectId} transaction - Reference to the associated Transaction model.
 * @property {string} status - Current status of the webhook.
 * @property {Date} lastAttempt - Timestamp of the last attempt to process the webhook.
 * @property {boolean} isDeleted - Flag indicating soft deletion status.
 * @property {Date} deletedAt - Timestamp of when the webhook was marked as deleted.
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
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
    lastAttempt: Date,
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date,
  },
  { timestamps: true },
);

/**
 * Soft delete method for the Webhook model.
 * Marks the webhook as deleted (soft delete) without actually removing it from the database.
 * Useful for maintaining records and audits while preventing further processing of the webhook.
 *
 * @function
 * @name softDelete
 * @memberof module:models/Webhook~WebhookSchema
 * @instance
 * @async
 * @return {Promise<module:models/Webhook~WebhookSchema>} The updated Webhook object after marking it as deleted.
 * @throws {Error} If an error occurs during the soft delete process.
 */
webhookSchema.methods.softDelete = async function () {
  try {
    this.isDeleted = true;
    this.deletedAt = new Date();
    await this.save();
    return this;
  } catch (err) {
    throw err;
  }
};

/**
 * Webhook model based on the defined schema.
 * Represents a blockchain event webhook in the Satoshi Showdown platform, encapsulating configuration,
 * status, transaction association, and lifecycle management. This model is vital for the integration
 * and handling of asynchronous events and notifications from blockchain networks and services.
 *
 * @typedef {mongoose.Model<module:models/Webhook~WebhookSchema>} WebhookModel
 */

/**
 * @type {WebhookModel}
 */
const Webhook = mongoose.model("Webhook", webhookSchema);

module.exports = Webhook;
