const Event = require("../models/eventModel");
const Transaction = require("../models/transactionModel");
const walletService = require("./walletService");
const BlockCypherService = require("./blockcypherService");

const blockCypherService = new BlockCypherService(
  process.env.BLOCKCYPHER_TOKEN
);

const eventService = {
  async createEvent(eventData) {
    try {
      const creatorWallet = await walletService.createSegwitWallet();
      eventData.wallet = creatorWallet._id;

      const newEvent = new Event({
        ...eventData,
        creatorDepositAddress: creatorWallet.address,
      });
      await newEvent.save();

      const newTransactionEntry = new Transaction({
        event: newEvent._id,
        address: creatorWallet.address,
        transactionStatus: "waiting",
      });
      await newTransactionEntry.save();

      // Create a webhook for the event's Bitcoin address
      await blockCypherService.createWebhook(
        creatorWallet.address,
        "https://22f5-149-102-224-202.ngrok-free.app/blockcypher/webhook"
      );

      return newEvent;
    } catch (error) {
      console.error("Error creating event:", error);
      throw error;
    }
  },

  // Additional methods...
};

module.exports = eventService;
