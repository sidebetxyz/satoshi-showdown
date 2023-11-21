const axios = require("axios");
const Webhook = require("../models/webhookModel");
const Transaction = require("../models/transactionModel"); // Import the Transaction model
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
    console.log("Received BlockCypher webhook event for Unique ID:", uniqueId);
    console.log("Webhook event data:", data);

    const webhook = await Webhook.findOne({ uniqueId: uniqueId });

    if (webhook) {
      console.log("Webhook found:", webhook);

      const transaction = await Transaction.findById(webhook.transactionId);
      if (transaction) {
        console.log(transaction);

        const expectedAmount = transaction.transactionInfo.amount;
        const receivedAmount = this.extractAmountFromWebhookData(
          data,
          webhook.address
        );

        console.log(expectedAmount);
        console.log(receivedAmount);

        // Update transaction with the current number of confirmations
        transaction.confirmations = data.confirmations;
        await transaction.save();

        if (receivedAmount === expectedAmount && data.confirmations === 0) {
          transaction.transactionStatus = "processing";
          await transaction.save();
          console.log("Transaction processing started:", transaction);
        }

        if (data.confirmations >= webhook.totalConfirmations) {
          transaction.transactionStatus = "complete";
          await transaction.save();
          webhook.status = "processed";
          webhook.processedAt = new Date();
          await webhook.save();
          console.log("Transaction completed:", transaction);
        }
      } else {
        console.error(
          "Transaction not found for webhook:",
          webhook.transactionId
        );
      }
    } else {
      console.error("Webhook with unique ID not found:", uniqueId);
    }
  }

  extractAmountFromWebhookData(data, subscribedAddress) {
    let amount = 0;
    data.outputs.forEach((output) => {
      if (output.addresses.includes(subscribedAddress)) {
        amount = output.value;
      }
    });
    return amount;
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
