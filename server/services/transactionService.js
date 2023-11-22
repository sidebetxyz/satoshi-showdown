const TransactionModel = require("../models/transactionModel");
const WebhookModel = require("../models/webhookModel"); // Import the Webhook model
const EventService = require("./eventService"); // Import the EventService

class TransactionService {
  // Initialization
  constructor() {}

  // Create a new transaction
  async createTransaction(walletId, address, amount) {
    try {
      const newTransaction = new TransactionModel({
        wallet: walletId,
        address: address,
        transactionInfo: {
          amount: amount,
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

  // Process webhook data and update the corresponding transaction
  async processWebhook(webhookId, data) {
    const webhook = await WebhookModel.findById(webhookId);
    if (!webhook) {
      throw new Error(`Webhook with ID ${webhookId} not found`);
    }

    const transaction = await TransactionModel.findById(webhook.transactionId);
    if (!transaction) {
      throw new Error(`Transaction with ID ${webhook.transactionId} not found`);
    }

    // Update confirmations
    transaction.confirmations = data.confirmations;
    await transaction.save();

    // Check for the amount and update status
    const receivedAmount = this.extractAmountFromWebhookData(
      data,
      transaction.address
    );

    if (receivedAmount === transaction.transactionInfo.amount) {
      if (data.confirmations === 0) {
        transaction.transactionStatus = "processing";
      } else if (data.confirmations > 0 && data.confirmations < 6) {
        transaction.transactionStatus = "confirming";
      } else if (data.confirmations >= 6) {
        transaction.transactionStatus = "complete";
        await transaction.save();

        // Update the event based on transaction completion
        const eventService = new EventService();
        await eventService.updateEventOnTransactionComplete(transaction._id);
      }
      await transaction.save();
    } else {
      console.error("Received amount does not match expected amount");
      transaction.transactionStatus = "error";
      await transaction.save();
    }
  }

  // Extract the amount from webhook data
  extractAmountFromWebhookData(data, address) {
    let amount = 0;
    data.outputs.forEach((output) => {
      if (output.addresses.includes(address)) {
        amount = output.value;
      }
    });
    return amount;
  }

  // Validate the transaction based on the data received from webhook
  validateTransaction(transactionData, expectedAmount) {
    // Add logic for transaction validation
    // Return true if valid, false otherwise
  }

  // Update the transaction status
  async updateTransactionStatus(transactionId, newStatus) {
    await TransactionModel.findByIdAndUpdate(transactionId, {
      status: newStatus,
    });
    console.log("Updated transaction status:", transactionId, newStatus);
  }

  // Notify relevant parties about the transaction
  notifyPartiesAboutTransaction(transaction) {
    console.log("Notifying parties about transaction:", transaction);
    // Additional logic for notifications
  }
}

module.exports = new TransactionService();
