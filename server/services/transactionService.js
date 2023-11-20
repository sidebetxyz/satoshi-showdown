const TransactionModel = require("../models/transactionModel");
const EventModel = require("../models/eventModel"); // Import the Event model

class TransactionService {
  constructor() {
    // Initialization
  }

  async createTransaction(walletId, address, amount, hash) {
    try {
      const newTransaction = new TransactionModel({
        wallet: walletId,
        address: address,
        transactionInfo: {
          amount: amount,
          hash: hash,
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

  async processTransaction(output, transaction) {
    const event = await this.getEventByAddress(output.addr);
    if (!event) {
      console.error(`Event not found for address: ${output.addr}`);
      return;
    }

    const isValidTransaction = this.validateTransaction(
      output,
      transaction,
      event.entryFee
    );

    console.log(`Processing transaction:`, transaction);

    if (isValidTransaction) {
      await TransactionModel.updateTransactionStatus(
        transaction.hash,
        "confirmed"
      );
      this.notifyPartiesAboutTransaction(transaction);
    } else {
      console.log("Invalid transaction detected:", transaction);
    }
  }

  async getEventByAddress(address) {
    return await EventModel.findOne({ creatorDepositAddress: address });
  }

  validateTransaction(output, transaction, expectedAmount) {
    const transactionAmount = output.value; // Assuming value is in the output
    return transactionAmount === expectedAmount;
  }

  async updateTransactionStatus(transactionHash, newStatus) {
    await TransactionModel.findOneAndUpdate(
      { hash: transactionHash },
      { status: newStatus }
    );
    console.log("Updated transaction status:", transactionHash, newStatus);
  }

  notifyPartiesAboutTransaction(transaction) {
    console.log("Notifying parties about transaction:", transaction);
  }
}

module.exports = new TransactionService();
