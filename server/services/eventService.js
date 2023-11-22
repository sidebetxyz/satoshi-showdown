const EventModel = require("../models/eventModel");
const WalletService = require("./walletService");
const TransactionService = require("./transactionService");
const WebhookService = require("./webhookService");
const TransactionModel = require("../models/transactionModel");

// Initialize services
const webhookService = new WebhookService();
const transactionService = new TransactionService();

const eventService = {
  // Method to create a new event
  async createEvent(eventData) {
    try {
      // Create a new wallet for the event
      const newWallet = await WalletService.createSegwitWallet();

      // Create a new transaction for the event's entry fee
      const newTransaction = await transactionService.createTransaction(
        newWallet._id,
        newWallet.address,
        eventData.entryFee
      );

      // Set up a new webhook for transaction confirmation
      const newWebhook = await webhookService.createWebhook(
        newWallet.address,
        newTransaction._id,
        eventData.confirmations
      );

      // Create and save the new event model
      const newEvent = new EventModel({
        ...eventData,
        participants: [
          { wallet: newWallet._id, transaction: newTransaction._id },
        ],
        status: "awaitingDeposit",
      });
      await newEvent.save();

      console.log("Event created:", newEvent);
      return newEvent;
    } catch (error) {
      console.error("Error in event creation:", error);
      throw error;
    }
  },

  // Method to update an event upon transaction completion
  async updateEventOnTransactionComplete(transactionId) {
    try {
      // Check if transaction is complete
      const transaction = await TransactionModel.findById(transactionId);
      if (!transaction || transaction.transactionStatus !== "complete") {
        throw new Error("Transaction not complete or not found");
      }

      // Find the associated event
      const event = await EventModel.findOne({
        "participants.transaction": transactionId,
      });
      if (!event) {
        throw new Error("Event not found for the given transaction");
      }

      // Check if all participants' transactions are complete
      const allParticipantsComplete = await Promise.all(
        event.participants.map(async (part) => {
          const participantTransaction = await TransactionModel.findById(
            part.transaction
          );
          return participantTransaction.transactionStatus === "complete";
        })
      ).then((results) => results.every((status) => status));

      // Update event status if all participants have completed transactions
      if (allParticipantsComplete) {
        event.status = "active";
        await event.save();
        console.log("Event updated to active:", event);
      }

      return event;
    } catch (error) {
      console.error("Error updating event on transaction complete:", error);
      throw error;
    }
  },

  // Method to retrieve an event by its public ID
  async getEventByPublicId(publicId) {
    try {
      // Fetch the event by public ID
      const event = await EventModel.findOne({ publicId });
      if (!event) {
        throw new Error("Event not found");
      }
      return event;
    } catch (error) {
      console.error("Error retrieving event:", error);
      throw error;
    }
  },

  // Method to allow a user to join an event
  async joinEvent(publicId, participantData) {
    try {
      // Validate if the event is accepting participants
      const event = await this.getEventByPublicId(publicId);
      if (event.status !== "awaitingParticipants") {
        throw new Error("Event is not accepting new participants");
      }

      // Create a wallet and transaction for the new participant
      const newWallet = await WalletService.createSegwitWallet();
      const newTransaction = await transactionService.createTransaction(
        newWallet._id,
        newWallet.address,
        event.entryFee
      );

      // Create a webhook for the new transaction
      const newWebhook = await webhookService.createWebhook(
        newWallet.address,
        newTransaction._id,
        event.confirmations
      );

      // Add the participant to the event
      event.participants.push({
        wallet: newWallet._id,
        transaction: newTransaction._id,
      });

      await event.save();
      console.log("Participant added to event:", event);
      return event;
    } catch (error) {
      console.error("Error joining event:", error);
      throw error;
    }
  },
};

module.exports = eventService;
