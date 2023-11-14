const Event = require("../models/eventModel");
const Blockchain = require("../models/blockchainModel");
const walletService = require("./walletService"); // Assuming this service has the wallet creation logic

const eventService = {
  async createEvent(eventData) {
    try {
      // Generate a Bitcoin address for the event using the wallet service
      const creatorWallet = await walletService.createSegwitWallet();

      // Add wallet reference to the event data
      eventData.wallet = creatorWallet._id;

      // Create the event
      const newEvent = new Event({
        ...eventData,
        // Add other event-specific data
      });
      await newEvent.save();

      // Create an initial blockchain entry for the event
      const newBlockchainEntry = new Blockchain({
        event: newEvent._id,
        address: creatorWallet.address,
        transactionStatus: "waiting", // Initial status
        // other blockchain fields
      });
      await newBlockchainEntry.save();

      return newEvent;
    } catch (error) {
      console.error("Error creating event:", error);
      throw error;
    }
  },
};

module.exports = eventService;
