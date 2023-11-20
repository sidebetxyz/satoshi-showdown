const express = require("express");
const router = express.Router();
const WebhookService = require("../services/webhookService");

// POST endpoint for handling BlockCypher webhook events
router.post("/receive", async (req, res) => {
  try {
    const eventData = req.body;

    // Process the event using Webhook Service
    await WebhookService.handleWebhook(eventData);

    // Respond with a success status
    res.status(200).send("Event processed successfully");
  } catch (error) {
    console.error("Error processing BlockCypher event:", error);

    // Respond with an error status if something goes wrong
    res.status(500).send("Error processing event");
  }
});

module.exports = router;
