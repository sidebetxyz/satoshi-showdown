const TransactionModel = require("../models/transactionModel");
const EventModel = require("../models/eventModel"); // Import the Event model
const WebhookModel = require("../models/webhookModel"); // Import the Webhook model

class TransactionService {
  constructor() {
    // Initialization
  }

  async createTransaction(walletId, address, amount) {
    try {
      const newTransaction = new TransactionModel({
        wallet: walletId,
        address: address,
        transactionInfo: {
          amount: amount
        },
        transactionStatus: "waiting",
      });

      await newTransaction.save();
      console.log("Transaction created:", newTransaction);
      return newTransaction;
    } catch (error) {
      console.error("Error creating transaction:", error);
      throw error;
    }
  }

  async processWebhook(webhookId, transactionData) {
    try {
      const webhook = await WebhookModel.findById(webhookId);
      if (!webhook) {
        throw new Error(`Webhook with ID ${webhookId} not found`);
      }

      // Find the corresponding transaction and event
      const transaction = await TransactionModel.findById(
        webhook.transactionId
      );
      const event = await EventModel.findById(webhook.eventId);

      if (!transaction || !event) {
        throw new Error("Transaction or Event not found for the given webhook");
      }

      // Validate the transaction
      const isValidTransaction = this.validateTransaction(
        transactionData,
        event.entryFee
      );

      if (isValidTransaction) {
        await this.updateTransactionStatus(transaction._id, "confirmed");
        this.notifyPartiesAboutTransaction(transaction);

        // Update the webhook status
        webhook.status = "processed";
        webhook.processedAt = new Date();
        await webhook.save();
      } else {
        webhook.status = "error";
        webhook.errorDetails = "Invalid transaction detected";
        await webhook.save();
      }
    } catch (error) {
      console.error("Error processing webhook:", error);
    }
  }

  validateTransaction(transactionData, expectedAmount) {
    // Logic to validate the transaction based on the data received from webhook
    // For instance, comparing the transaction amount with expectedAmount
    // Return true if valid, false otherwise
  }

  async updateTransactionStatus(transactionId, newStatus) {
    await TransactionModel.findByIdAndUpdate(transactionId, {
      status: newStatus,
    });
    console.log("Updated transaction status:", transactionId, newStatus);
  }

  notifyPartiesAboutTransaction(transaction) {
    console.log("Notifying parties about transaction:", transaction);
    // Additional logic to notify relevant parties about the transaction
  }
}

module.exports = new TransactionService();
