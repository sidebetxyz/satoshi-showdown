const Event = require("../models/eventModel");
const Transaction = require("../models/transactionModel");
const walletService = require("./walletService");
const transactionService = require("./transactionService");
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

      // Create an initial transaction entry for the event
      const newTransactionEntry = new Transaction({
        event: newEvent._id,
        address: creatorWallet.address,
        transactionStatus: "waiting", // Initial status
        // other transaction fields
      });
      await newTransactionEntry.save();

      // Automatically start monitoring the new wallet's address
      transactionService.monitorAddress(
        creatorWallet.address,
        async (output, transaction) => {
          // Transaction validation logic
          const isValidTransaction = console.log("Hit isValidTransaction");

          if (isValidTransaction) {
            // Update the event and transaction entry status
            newTransactionEntry.transactionStatus = "processing"; // or other appropriate status
            newTransactionEntry.transactionInfo = {
              /* transaction details */
            };
            await newTransactionEntry.save();

            // Update event status if necessary
            newEvent.status = console.log("Hit newEvent.status");
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
