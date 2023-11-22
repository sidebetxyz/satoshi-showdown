const TransactionModel = require("../models/transactionModel");
const WebhookModel = require("../models/webhookModel");
const EventService = require("./eventService");

class TransactionService {
  constructor() {
    // Constructor can be used for initialization if needed
  }

  // Create a new transaction in the system
  async createTransaction(walletId, address, amount) {
    try {
      // Constructing a new transaction object
      const newTransaction = new TransactionModel({
        wallet: walletId,
        address,
        transactionInfo: { amount },
        status: "waiting",
      });

      // Saving the transaction to the database
      await newTransaction.save();
      console.log("Transaction created:", newTransaction);
      return newTransaction;
    } catch (error) {
      // Handling errors during transaction creation
      console.error("Error creating transaction:", error);
      throw error;
    }
  }

  // Process the data received from a webhook
  async processWebhook(webhookId, data) {
    const webhook = await WebhookModel.findById(webhookId);
    if (!webhook) {
      throw new Error(`Webhook with ID ${webhookId} not found`);
    }

    const transaction = await TransactionModel.findById(webhook.transactionId);
    if (!transaction) {
      throw new Error(`Transaction with ID ${webhook.transactionId} not found`);
    }

    // Updating the number of confirmations for the transaction
    transaction.confirmations = data.confirmations;
    await transaction.save();

    // Checking the amount received and updating transaction status accordingly
    const receivedAmount = this.extractAmountFromWebhookData(
      data,
      transaction.address
    );

    if (receivedAmount === transaction.transactionInfo.amount) {
      // Update status based on the number of confirmations
      if (data.confirmations === 0) {
        transaction.status = "processing";
      } else if (data.confirmations > 0 && data.confirmations < 6) {
        transaction.status = "confirming";
      } else if (data.confirmations >= 6) {
        transaction.status = "complete";
        await transaction.save();

        // Trigger event update when the transaction is complete
        const eventService = new EventService();
        await eventService.updateEventOnTransactionComplete(transaction._id);
      }
      await transaction.save();
    } else {
      // Handling cases where the received amount does not match
      console.error("Received amount does not match expected amount");
      transaction.status = "error";
      await transaction.save();
    }
  }

  // Extracts the amount of cryptocurrency from the webhook data
  extractAmountFromWebhookData(data, address) {
    let amount = 0;
    data.outputs.forEach((output) => {
      if (output.addresses.includes(address)) {
        amount = output.value;
      }
    });
    return amount;
  }

  // Placeholder for transaction validation logic
  validateTransaction(transactionData, expectedAmount) {
    // Add validation logic here
  }

  // Updates the status of a specific transaction
  async updateTransactionStatus(transactionId, newStatus) {
    await TransactionModel.findByIdAndUpdate(transactionId, {
      status: newStatus,
    });
    console.log("Updated transaction status:", transactionId, newStatus);
  }

  // Placeholder for notification logic
  notifyPartiesAboutTransaction(transaction) {
    // Add notification logic here
  }
}

module.exports = new TransactionService();
