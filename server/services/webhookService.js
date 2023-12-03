// webhookService.js
/**
 * Webhook Service for Satoshi Showdown
 *
 * Manages the lifecycle of webhooks, including creation, updating, and deletion.
 * Interacts with external blockchain event monitoring services like BlockCypher,
 * and maintains the state of each webhook within the application's database.
 */

const axios = require('axios');
const Webhook = require('../models/webhookModel');

const blockCypherBaseUrl = 'https://api.blockcypher.com/v1/btc/main';
const blockCypherToken = process.env.BLOCKCYPHER_TOKEN; // Set BlockCypher token

const WebhookService = {
    /**
     * Creates a new webhook for monitoring blockchain events.
     * Registers the webhook with BlockCypher and saves it to the database.
     * 
     * @param {String} eventId - The associated event's ID.
     * @param {String} transactionId - The associated transaction's ID.
     * @param {String} callbackUrl - The URL for the callback.
     * @param {String} event - The blockchain event to monitor.
     * @returns {Object} The created webhook.
     */
    async createWebhook(eventId, transactionId, callbackUrl, event) {
        const webhookId = WebhookService.generateWebhookId();
        const data = {
            event: event,
            url: `${callbackUrl}/${webhookId}`,
            token: blockCypherToken
        };

        // Register the webhook with BlockCypher
        await axios.post(`${blockCypherBaseUrl}/hooks`, data);

        // Save the webhook in the database
        const newWebhook = new Webhook({
            urlId: webhookId,
            event: eventId,
            transaction: transactionId,
            status: 'pending'
        });
        await newWebhook.save();

        return newWebhook;
    },

    /**
     * Generates a unique identifier for a webhook.
     * 
     * @returns {String} A unique UUID for the webhook.
     */
    generateWebhookId() {
        return uuidv4();
    }

    // Additional methods like deleteWebhook, updateWebhook can be added as needed
};

module.exports = WebhookService;
