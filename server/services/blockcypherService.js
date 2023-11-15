const axios = require("axios");

class BlockCypherService {
  constructor(apiToken) {
    this.apiBaseUrl = "https://api.blockcypher.com/v1/btc/test3";
    this.apiToken = apiToken;
  }

  async createWebhook(address, callbackUrl) {
    const webhookData = {
      event: "unconfirmed-tx",
      address: address,
      url: callbackUrl,
    };

    try {
      const response = await axios.post(
        `${this.apiBaseUrl}/hooks?token=${this.apiToken}`,
        webhookData
      );
      console.log("Webhook created:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error creating webhook:", error);
      throw error;
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
    } catch (error) {
      console.error("Error deleting webhook:", error);
      throw error;
    }
  }
}

module.exports = BlockCypherService;
