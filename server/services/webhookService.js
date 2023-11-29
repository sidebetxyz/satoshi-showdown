import axios from "axios";
import WebhookModel from "../models/webhookModel.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Service for handling webhooks.
 * Webhooks are used for receiving real-time notifications or events from external systems.
 * This service facilitates the creation and processing of webhooks, particularly for transaction confirmations.
 */
export class WebhookService {
  constructor() {
    // Base URL and token for the external API (e.g., BlockCypher)
    this.apiBaseUrl = process.env.BLOCKCYPHER_BASE_URL;
    this.apiToken = process.env.BLOCKCYPHER_TOKEN;
  }

  /**
   * Creates a new webhook for monitoring transaction confirmations.
   *
   * @param {string} address - The Bitcoin address to monitor.
   * @param {string} transactionId - The ID of the associated transaction.
   * @param {number} [confirmations=6] - The number of confirmations to wait for.
   * @returns {Promise<Object>} The newly created webhook object.
   */
  async createWebhook(address, transactionId, confirmations = 6) {
    const uniqueId = uuidv4();
    const callbackUrl = `${process.env.WEBHOOK_DOMAIN}/webhook/receive/${uniqueId}`;
    const webhookData = {
      event: "tx-confirmation",
      address,
      url: callbackUrl,
      confirmations,
    };

    try {
      const response = await axios.post(
        `${this.apiBaseUrl}/hooks?token=${this.apiToken}`,
        webhookData
      );

      const newWebhook = new WebhookModel({
        uniqueId,
        address,
        transactionId,
        type: "tx-confirmation",
        status: "pending",
      });
      await newWebhook.save();

      return newWebhook;
    } catch (error) {
      console.error("Error creating tx-confirmation webhook:", error);
      throw error;
    }
  }

  /**
   * Handles the processing of an incoming webhook event.
   *
   * @param {string} uniqueId - The unique ID of the webhook.
   * @param {Object} data - The payload of the webhook event.
   * @returns {Promise<Object>} A response indicating the result of the processing.
   */
  async handleWebhook(uniqueId, data) {
    // Processing logic for the incoming webhook goes here
    console.log(`Handling webhook with unique ID: ${uniqueId} and data:`, data);
    return { status: "success", message: "Webhook processed successfully" };
  }

  // Additional methods for webhook management can be added here
}

export default WebhookService;
