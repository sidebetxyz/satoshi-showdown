const axios = require("axios");
const Webhook = require("../models/webhookModel");
const TransactionService = require("../services/transactionService"); // Import the Transaction model
const { v4: uuidv4 } = require("uuid");

class WebhookService {
  constructor() {
    this.apiBaseUrl = process.env.BLOCKCYPHER_BASE_URL;
    this.apiToken = process.env.BLOCKCYPHER_TOKEN;
  }

  async createWebhook(address, transactionId, confirmations = 6) {
    const uniqueId = uuidv4();
    const callbackUrl = `${process.env.WEBHOOK_DOMAIN}/webhook/receive/${uniqueId}`;

    const webhookData = {
      event: "tx-confirmation",
      address: address,
      url: callbackUrl,
      confirmations: confirmations,
    };

    try {
      const response = await axios.post(
        `${this.apiBaseUrl}/hooks?token=${this.apiToken}`,
        webhookData
      );

      const newWebhook = new Webhook({
        uniqueId: uniqueId,
        address: address,
        transactionId: transactionId, // Link the transaction ID
        type: "tx-confirmation",
        status: "pending",
      });
      await newWebhook.save();

      console.log("tx-confirmation Webhook created:", response.data);
      return newWebhook;
    } catch (error) {
      console.error("Error creating tx-confirmation webhook:", error);
      throw error;
    }
  }

  async handleWebhook(uniqueId, data) {
    try {
      const webhook = await Webhook.findOne({ uniqueId: uniqueId });

      if (webhook) {
        // Use TransactionService directly, without 'new'
        await TransactionService.processWebhook(webhook._id, data);
      } else {
        console.error("Webhook with unique ID not found:", uniqueId);
      }
    } catch (error) {
      console.error("Error handling webhook:", error);
    }
  }

  async listWebhooks() {
    try {
      const response = await axios.get(
        `${this.apiBaseUrl}/hooks?token=${this.apiToken}`
      );
      console.log("Active webhooks:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error listing webhooks:", error);
      throw error;
    }
  }

  async deleteWebhook(webhookId) {
    try {
      await axios.delete(
        `${this.apiBaseUrl}/hooks/${webhookId}?token=${this.apiToken}`
      );
      console.log("Webhook deleted successfully");
      // Optionally, remove the webhook from the database as well
    } catch (error) {
      console.error("Error deleting webhook:", error);
      throw error;
    }
  }
}

module.exports = WebhookService;
