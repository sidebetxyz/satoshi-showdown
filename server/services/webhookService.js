const axios = require("axios");
const Webhook = require("../models/webhookModel"); // Import the Webhook model

class WebhookService {
  constructor() {
    this.apiBaseUrl = process.env.BLOCKCYPHER_BASE_URL; // Moved to .env
    this.apiToken = process.env.BLOCKCYPHER_TOKEN; // Moved to .env
    this.webhookUrl = `${process.env.WEBHOOK_DOMAIN}/webhook/receive`;
  }

  async createWebhook(address, confirmations = 6) {
    const webhookData = {
      event: "tx-confirmation",
      address: address,
      url: this.webhookUrl,
      confirmations: confirmations,
    };

    try {
      const response = await axios.post(
        `${this.apiBaseUrl}/hooks?token=${this.apiToken}`,
        webhookData
      );

      // Save webhook data to the database
      const newWebhook = new Webhook({
        address: address,
        type: "tx-confirmation",
        status: "pending", // or another default status
        // Additional fields as needed
      });
      await newWebhook.save();

      console.log("tx-confirmation Webhook created:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error creating tx-confirmation webhook:", error);
      throw error;
    }
  }

  async handleWebhook(data) {
    // Log the entire data object received from BlockCypher
    console.log("Received BlockCypher webhook event:", data);

    // Additional processing logic goes here...
    // For now, just log the data to inspect its structure
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
    } catch (error) {
      console.error("Error deleting webhook:", error);
      throw error;
    }
  }
}

module.exports = WebhookService;
