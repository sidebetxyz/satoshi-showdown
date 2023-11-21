const TransactionModel = require("../models/transactionModel");
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
      }
      await transaction.save();
    } else {
      console.error("Received amount does not match expected amount");
      transaction.transactionStatus = "error";
      await transaction.save();
    }
  }

  // The rest of the methods remain unchanged

  extractAmountFromWebhookData(data, address) {
    let amount = 0;
    data.outputs.forEach((output) => {
      if (output.addresses.includes(address)) {
        amount = output.value;
      }
    });
    return amount;
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
