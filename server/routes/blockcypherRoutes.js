const express = require("express");
const router = express.Router();
const TransactionService = require("../services/transactionService");

// POST endpoint for handling BlockCypher webhook events
router.post("/webhook", async (req, res) => {
  try {
    const eventData = req.body;

    // Log the received event for debugging purposes
    console.log("Received BlockCypher webhook event:", eventData);

    // Process the event using TransactionService
    await TransactionService.handleWebhook(eventData);

    // Respond with a success status
    res.status(200).send("Event processed successfully");
  } catch (error) {
    console.error("Error processing BlockCypher event:", error);

    // Respond with an error status if something goes wrong
    res.status(500).send("Error processing event");
  }
});

module.exports = router;
