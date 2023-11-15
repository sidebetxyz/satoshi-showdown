const WebSocket = require("ws");

class TransactionService {
  constructor() {
    this.ws = new WebSocket("wss://ws.blockchain.info/inv");
    this.addressesToMonitor = new Map(); // Stores addresses and their associated callback functions
  }

  // Method to start the WebSocket connection
  start() {
    this.ws.on("open", () => {
      console.log("Connected to Blockchain WebSocket");
      // Subscribe to unconfirmed transactions if needed
      // this.ws.send(JSON.stringify({ "op": "unconfirmed_sub" }));
    });

    this.ws.on("message", (data) => this.handleMessage(data));
    this.ws.on("close", () => this.handleClose());
    this.ws.on("error", (error) => this.handleError(error));
  }

  // Method to add an address to monitor
  monitorAddress(address, callback) {
    this.addressesToMonitor.set(address, callback);
    // Subscribe to the address
    this.ws.send(JSON.stringify({ op: "addr_sub", addr: address }));
    console.log(`Started monitoring address: ${address}`);
  }

  // Method to stop monitoring an address
  stopMonitoringAddress(address) {
    if (this.addressesToMonitor.has(address)) {
      this.addressesToMonitor.delete(address);
      this.ws.send(JSON.stringify({ op: "addr_unsub", addr: address }));
    }
  }

  handleMessage(data) {
    const message = JSON.parse(data);

    if (message.op === "utx") {
      const transactionOutputs = message.x.out;
      transactionOutputs.forEach((output) => {
        if (this.addressesToMonitor.has(output.addr)) {
          const callback = this.addressesToMonitor.get(output.addr);
          callback(output, message.x); // Call the callback with transaction details

          // Log the transaction details
          console.log(
            `Transaction detected for address ${output.addr}:`,
            message.x
          );
        }
      });
    }
  }

  // Method to handle WebSocket closure
  handleClose() {
    console.log("WebSocket connection closed. Attempting to reconnect...");
    setTimeout(() => this.start(), 5000); // Reconnect after a delay
  }

  // Method to handle WebSocket errors
  handleError(error) {
    console.error("WebSocket error:", error);
  }

  // Method for transaction validation and processing
  async processTransaction(output, transaction) {
    const isValidTransaction = this.validateTransaction(output, transaction);

    // Log the transaction processing attempt
    console.log(
      `Processing transaction for address ${output.addr}:`,
      transaction
    );

    if (isValidTransaction) {
      // Update transaction status in your model
      await TransactionModel.updateTransactionStatus(
        transaction.hash,
        "confirmed"
      );

      // Notify relevant parties about the transaction
      this.notifyPartiesAboutTransaction(transaction);
    } else {
      console.log("Invalid transaction detected:", transaction);
    }
  }

  validateTransaction(output, transaction) {
    // Example validation logic
    const expectedAmount = console.log("Hit expectedAmount");
    const transactionAmount = output.value; // Assuming value is in the output
    return transactionAmount === expectedAmount;
  }

  async updateTransactionStatus(transaction) {
    // Implement the logic to update the transaction status in your database
    console.log("Updating transaction status:", transaction);
  }

  notifyPartiesAboutTransaction(transaction) {
    // Implement the logic to notify relevant parties about the transaction
    console.log("Notifying parties about transaction:", transaction);
  }
}

module.exports = new TransactionService();
