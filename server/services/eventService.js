const Event = require("../models/eventModel");
const Blockchain = require("../models/blockchainModel");
const walletService = require("./walletService");
const BlockchainService = require("./blockchainService");

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

      // Automatically start monitoring the new wallet's address
      BlockchainService.monitorAddress(
        creatorWallet.address,
        async (output, transaction) => {
          // Validate the transaction (e.g., check amount matches entry fee, etc.)
          const isValidTransaction = console.log(
            "Transaction validation goes here."
          );

          if (isValidTransaction) {
            // Update the event and blockchain entry status
            newBlockchainEntry.transactionStatus = "processing"; // or other appropriate status
            newBlockchainEntry.transactionInfo = {
              /* transaction details */
            };
            await newBlockchainEntry.save();

            // Update event status if necessary
            newEvent.status = console.log("New event status goes here.");
            await newEvent.save();

            // Notify participants or perform other actions as needed
          } else {
            console.log("Invalid transaction detected:", transaction);
            // Handle invalid transaction case
          }
        }
      );

      return newEvent;
    } catch (error) {
      console.error("Error creating event:", error);
      throw error;
    }
  },
};

module.exports = eventService;
