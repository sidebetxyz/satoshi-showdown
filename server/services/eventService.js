const EventModel = require("../models/eventModel");
const WalletService = require("./walletService");
const TransactionService = require("./transactionService");
const WebhookService = require("./webhookService");
const TransactionModel = require("../models/transactionModel"); // Import TransactionModel

const webhookService = new WebhookService();
const transactionService = new TransactionService(); // Instantiate TransactionService

const eventService = {
  // Create a new event
  async createEvent(eventData) {
    try {
      const newWallet = await WalletService.createSegwitWallet();
      const newTransaction = await transactionService.createTransaction(
        newWallet._id,
        newWallet.address,
        eventData.entryFee
      );

      const newWebhook = await webhookService.createWebhook(
        newWallet.address,
        newTransaction._id,
        eventData.confirmations // Assuming confirmations are part of eventData
      );

      const newEvent = new EventModel({
        ...eventData,
        participants: [
          { wallet: newWallet._id, transaction: newTransaction._id },
        ],
        status: "awaitingDeposit", // Set initial status
      });
      await newEvent.save();

      console.log("Event created:", newEvent);
      return newEvent;
    } catch (error) {
      console.error("Error in event creation:", error);
      throw error;
    }
  },

  // Update event based on transaction completion
  async updateEventOnTransactionComplete(transactionId) {
    try {
      const transaction = await TransactionModel.findById(transactionId);
      if (!transaction || transaction.transactionStatus !== "complete") {
        throw new Error("Transaction not complete or not found.");
      }

      const event = await EventModel.findOne({
        "participants.transaction": transactionId,
      });
      if (!event) {
        throw new Error("Event not found for the given transaction.");
      }

      // Check if all participant's transactions are complete
      const allParticipantsComplete = await Promise.all(
        event.participants.map(async (part) => {
          const participantTransaction = await TransactionModel.findById(
            part.transaction
          );
          return participantTransaction.transactionStatus === "complete";
        })
      ).then((results) => results.every((status) => status));

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

  // Retrieve an event by its publicId
  async getEventByPublicId(publicId) {
    try {
      const event = await EventModel.findOne({ publicId });
      if (!event) {
        throw new Error("Event not found.");
      }
      return event;
    } catch (error) {
      console.error("Error retrieving event:", error);
      throw error;
    }
  },

  // Method to join an event
  async joinEvent(publicId, participantData) {
    try {
      const event = await this.getEventByPublicId(publicId);

      // Check if the event is accepting participants
      if (event.status !== "awaitingParticipants") {
        throw new Error("Event is not accepting new participants.");
      }

      // Create a new wallet for the participant
      const newWallet = await WalletService.createSegwitWallet();

      // Create a new transaction for the participant's entry fee
      const newTransaction = await transactionService.createTransaction(
        newWallet._id,
        newWallet.address,
        event.entryFee // Assuming event has an entryFee field
      );

      // Create a new webhook for the transaction
      const newWebhook = await webhookService.createWebhook(
        newWallet.address,
        newTransaction._id,
        event.confirmations // Assuming event has a confirmations field
      );

      // Add the new participant to the event
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
