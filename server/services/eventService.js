// Import models and other services
const EventModel = require("../models/eventModel");
const WalletService = require("./walletService");
const TransactionService = require("./transactionService");
const WebhookService = require("./webhookService");

const webhookService = new WebhookService();

const eventService = {
  async createEvent(eventData) {
    try {
      const newWallet = await WalletService.createSegwitWallet();
      const newTransaction = await TransactionService.createTransaction(
        newWallet._id,
        newWallet.address,
        eventData.entryFee
      );

      const newWebhook = await webhookService.createWebhook(
        newWallet.address,
        newTransaction._id
      );

      const newEvent = new EventModel({
        ...eventData,
        participants: [
          { wallet: newWallet._id, transaction: newTransaction._id },
        ],
      });
      await newEvent.save();

      return newEvent;
    } catch (error) {
      console.error("Error in event creation:", error);
      throw error;
    }
  },
  // Other methods...
};

module.exports = eventService;
