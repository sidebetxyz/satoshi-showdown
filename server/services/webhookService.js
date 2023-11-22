const axios = require("axios");
const Webhook = require("../models/webhookModel");
const TransactionService = require("../services/transactionService");
const { v4: uuidv4 } = require("uuid");

class WebhookService {
  constructor() {
    // Setting up base URL and API token for BlockCypher
    this.apiBaseUrl = process.env.BLOCKCYPHER_BASE_URL;
    this.apiToken = process.env.BLOCKCYPHER_TOKEN;
  }

  // Create a new webhook for transaction confirmations
  async createWebhook(address, transactionId, confirmations = 6) {
    // Generating a unique identifier for the webhook
    const uniqueId = uuidv4();

    // Constructing the callback URL for the webhook
    const callbackUrl = `${process.env.WEBHOOK_DOMAIN}/webhook/receive/${uniqueId}`;

    // Webhook configuration data
    const webhookData = {
      event: "tx-confirmation",
      address: address,
      url: callbackUrl,
      confirmations: confirmations,
    };

    try {
      // Sending a request to create the webhook
      const response = await axios.post(
        `${this.apiBaseUrl}/hooks?token=${this.apiToken}`,
        webhookData
      );

      // Saving the new webhook to the database
      const newWebhook = new Webhook({
        uniqueId: uniqueId,
        address: address,
        transactionId: transactionId,
        type: "tx-confirmation",
        status: "pending",
      });
      await newWebhook.save();

      console.log("tx-confirmation Webhook created:", response.data);
      return newWebhook;
    } catch (error) {
      // Handling errors in webhook creation
      console.error("Error creating tx-confirmation webhook:", error);
      throw error;
    }
  }

  // Handle incoming webhook data
  async handleWebhook(uniqueId, data) {
    try {
      // Retrieving the webhook from the database
      const webhook = await Webhook.findOne({ uniqueId: uniqueId });

      if (webhook) {
        // Processing the webhook using TransactionService
        await TransactionService.processWebhook(webhook._id, data);
      } else {
        console.error("Webhook with unique ID not found:", uniqueId);
      }
    } catch (error) {
      // Handling errors in webhook processing
      console.error("Error handling webhook:", error);
    }
  }

  // List all active webhooks
  async listWebhooks() {
    try {
      // Retrieving active webhooks from BlockCypher
      const response = await axios.get(
        `${this.apiBaseUrl}/hooks?token=${this.apiToken}`
      );
      console.log("Active webhooks:", response.data);
      return response.data;
    } catch (error) {
      // Handling errors in listing webhooks
      console.error("Error listing webhooks:", error);
      throw error;
    }
  }

  // Delete a webhook
  async deleteWebhook(webhookId) {
    try {
      // Sending a request to delete the webhook
      await axios.delete(
        `${this.apiBaseUrl}/hooks/${webhookId}?token=${this.apiToken}`
      );
      console.log("Webhook deleted successfully");
    } catch (error) {
      // Handling errors in webhook deletion
      console.error("Error deleting webhook:", error);
      throw error;
    }
  }
}

module.exports = WebhookService;
