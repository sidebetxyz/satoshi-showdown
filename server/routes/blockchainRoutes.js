const express = require("express");
const router = express.Router();
const Blockchain = require("../models/blockchainModel");
const BlockchainService = require("../services/blockchainService");

// Route to start monitoring transactions using the BlockchainService
router.get("/startMonitoring", (req, res) => {
  BlockchainService.start(); // Starts the WebSocket connection
  res.send("Started monitoring blockchain transactions.");
});

// Route to monitor a specific address
router.post("/monitorAddress", (req, res) => {
  const { address } = req.body;

  // Define the callback function for transaction detection
  const transactionCallback = (output, transaction) => {
    // Implement logic to handle the detected transaction
    // e.g., validate, save to database, notify users
    console.log(`Transaction detected for address ${address}:`, transaction);

    // Save transaction details using Blockchain model
    const newTransaction = new Blockchain({
      // Set transaction details based on the output and transaction
    });

    newTransaction
      .save()
      .then(() => {
        console.log("Transaction saved to database.");
      })
      .catch((error) => {
        console.error("Error saving transaction:", error);
      });
  };

  // Start monitoring the address using BlockchainService
  BlockchainService.monitorAddress(address, transactionCallback);

  res.send(`Started monitoring address: ${address}`);
});

// Existing route to add a new transaction - might be used for manual additions or other purposes
router.post("/addTransaction", async (req, res) => {
  try {
    const { eventId, transactionData } = req.body;

    // Validate event ID and transaction data
    // You might also want to validate if the event exists

    const newTransaction = new Blockchain({
      event: eventId,
      address: transactionData.address,
      transactionStatus: "waiting", // or as per transactionData
      transactionInfo: {
        // Set transaction details
      },
      // Other fields
    });

    await newTransaction.save();
    res.status(201).json(newTransaction);
  } catch (error) {
    console.error("Error adding transaction:", error);
    res.status(500).send("Failed to add transaction");
  }
});

// Route to update a transaction status
router.patch("/updateTransaction/:transactionId", async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { newStatus } = req.body;

    // Validate transactionId and newStatus

    const updatedTransaction = await Blockchain.findByIdAndUpdate(
      transactionId,
      { transactionStatus: newStatus },
      { new: true } // Return the updated document
    );

    if (!updatedTransaction) {
      return res.status(404).send("Transaction not found");
    }

    res.json(updatedTransaction);
  } catch (error) {
    console.error("Error updating transaction:", error);
    res.status(500).send("Failed to update transaction");
  }
});

// Add other routes as needed

module.exports = router;
