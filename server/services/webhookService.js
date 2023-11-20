const axios = require("axios");

class WebhookService {
  constructor(apiToken) {
    this.apiBaseUrl = "https://api.blockcypher.com/v1/btc/test3";
    this.apiToken = apiToken;
    this.webhookUrl = `${process.env.WEBHOOK_DOMAIN}/webhook/receive`; // Set the webhook URL
  }

  async createWebhook(address, confirmations = 6) {
    const webhookData = {
      event: "tx-confirmation",
      address: address,
      url: this.webhookUrl,
      confirmations: confirmations, // Number of confirmations to wait for
    };

    try {
      const response = await axios.post(
        `${this.apiBaseUrl}/hooks?token=${this.apiToken}`,
        webhookData
      );
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
