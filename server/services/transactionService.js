const TransactionModel = require("../models/transactionModel");
const EventModel = require("../models/eventModel"); // Import the Event model

class TransactionService {
  constructor() {
    // Initialization
  }

  async handleWebhook(data) {
    console.log("Received transaction event:", data);

    for (const tx of data.txs) {
      const output = tx.outputs[0]; // Assuming the first output
      await this.processTransaction(output, tx);
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
