const EventModel = require("../models/eventModel");
const WalletService = require("./walletService");
const TransactionService = require("./transactionService");
const WebhookService = require("./webhookService");
const TransactionModel = require("../models/transactionModel");

class EventService {
  constructor() {}

  // Create a new event with initial participant (event creator)
  async createEvent(eventData) {
    try {
      const walletService = new WalletService();
      const transactionService = new TransactionService();
      const webhookService = new WebhookService();

      const newWallet = await walletService.createSegwitWallet();
      const newTransaction = await transactionService.createTransaction(
        newWallet._id,
        newWallet.address,
        eventData.entryFee
      );

      const newWebhook = await webhookService.createWebhook(
        newWallet.address,
        newTransaction._id,
        eventData.confirmations
      );

      const newEvent = new EventModel({
        ...eventData,
        participants: [
          {
            wallet: newWallet._id,
            transaction: newTransaction._id,
            depositAddress: newWallet.address,
            transactionUniqueId: newTransaction.uniqueId,
          },
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
  }

  // Retrieve an event by its public ID
  async getEventByPublicId(publicId) {
    try {
      const event = await EventModel.findOne({ publicId });
      if (!event) {
        throw new Error("Event not found");
      }
      return event;
    } catch (error) {
      console.error("Error retrieving event:", error);
      throw error;
    }
  }

  // Join an existing event as a participant
  async joinEvent(publicId) {
    try {
      const walletService = new WalletService();
      const transactionService = new TransactionService();
      const webhookService = new WebhookService();

      const event = await this.getEventByPublicId(publicId);
      if (
        event.status !== "awaitingParticipants" ||
        event.getAvailableSlots() === 0
      ) {
        throw new Error("Event is not accepting new participants or is full");
      }

      const newWallet = await walletService.createSegwitWallet();
      const newTransaction = await transactionService.createTransaction(
        newWallet._id,
        newWallet.address,
        event.entryFee
      );

      const newWebhook = await webhookService.createWebhook(
        newWallet.address,
        newTransaction._id,
        event.confirmations
      );

      event.participants.push({
        wallet: newWallet._id,
        transaction: newTransaction._id,
        depositAddress: newWallet.address,
        transactionUniqueId: newTransaction.uniqueId,
      });

      await event.save();
      console.log("Participant added to event:", event);
      return event;
    } catch (error) {
      console.error("Error joining event:", error);
      throw error;
    }
  }

  // Update event status when a transaction is in processing state
  async updateEventOnTransactionProcessing(transactionId) {
    try {
      const transactionService = new TransactionService();
      const transaction = await transactionService.getTransactionById(
        transactionId
      );

      if (!transaction || transaction.status !== "processing") {
        throw new Error("Transaction not in processing state or not found");
      }

      const event = await EventModel.findOne({
        "participants.transactionUniqueId": transaction.uniqueId,
      });

      if (!event) {
        throw new Error("Event not found for the given transaction");
      }

      if (event.status === "awaitingDeposit") {
        event.status = "awaitingParticipants";
        await event.save();
        console.log("Event status updated to awaiting participants:", event);
      }

      return event;
    } catch (error) {
      console.error("Error updating event on transaction processing:", error);
      throw error;
    }
  }

  // Finalize the event when all participant spots are filled
  async finalizeEventWhenFull(eventId) {
    try {
      const event = await EventModel.findById(eventId);
      if (!event) {
        throw new Error("Event not found");
      }

      if (event.participants.length >= event.maxParticipants) {
        event.status = "active";
        await event.save();
        console.log("Event finalized as all spots are filled:", event);
      }

      return event;
    } catch (error) {
      console.error("Error finalizing event when full:", error);
      throw error;
    }
  }

  // Method to process payments
  async processPayment(transactionId, data) {
    const transaction = await TransactionModel.findById(transactionId);
    if (!transaction) {
      throw new Error(`Transaction with ID ${transactionId} not found`);
    }

    transaction.confirmations = data.confirmations;
    await transaction.save();

    const receivedAmount = this._extractAmountFromWebhookData(
      data,
      transaction.address
    );

    if (receivedAmount === transaction.transactionInfo.amount) {
      if (data.confirmations === 0) {
        transaction.status = "processing";
        await this.updateEventOnTransactionProcessing(transaction._id);
      } else if (data.confirmations >= 6) {
        transaction.status = "complete";
        await this.finalizeEventWhenFull(transaction.eventId);
      }
      await transaction.save();
    } else {
      console.error("Received amount does not match expected amount");
      transaction.status = "error";
      await transaction.save();
    }
  }

  _extractAmountFromWebhookData(data, address) {
    let amount = 0;
    data.outputs.forEach((output) => {
      if (output.addresses.includes(address)) {
        amount = output.value;
      }
    });
    return amount;
  }
}

module.exports = EventService;
