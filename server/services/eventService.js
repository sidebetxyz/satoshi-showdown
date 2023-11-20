const walletService = require("./walletService");
const TransactionService = require("./transactionService");
const WebhookService = require("./webhookService");
const EventModel = require("../models/eventModel");

const webhookService = new WebhookService(process.env.BLOCKCYPHER_TOKEN);

const eventService = {
  async createEvent(eventData) {
    try {
      // Step 1: Create Wallet
      const newWallet = await walletService.createSegwitWallet();

      // Step 2: Create Transaction
      const newTransaction = await TransactionService.createTransaction(
        newWallet._id,
        newWallet.address,
        eventData.transactionAmount, // Example amount
        eventData.transactionHash // Example hash
      );

      // Step 3: Create Webhook
      const newWebhook = await webhookService.createWebhook(newWallet.address);

      // Step 4: Create Event with Wallet and Transaction information
      const newEvent = new EventModel({
        ...eventData,
        participants: [
          {
            wallet: newWallet._id,
            transaction: newTransaction._id,
          },
        ],
        // Other event details
      });
      await newEvent.save();

      return newEvent;
    } catch (error) {
      console.error("Error in event creation:", error);
      throw error;
    }
  },
  // Additional methods...
};

module.exports = eventService;
