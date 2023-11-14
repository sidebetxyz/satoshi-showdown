const express = require("express");
const router = express.Router();
const Blockchain = require("../models/blockchainModel");
const Event = require("../models/eventModel"); // Import if needed for referencing events
// Import other required models or services

// Route to add a new transaction to an event
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
