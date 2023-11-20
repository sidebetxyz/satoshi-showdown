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

  // ... other methods ...
}

module.exports = WebhookService;
