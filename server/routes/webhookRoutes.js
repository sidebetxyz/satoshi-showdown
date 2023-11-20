const express = require("express");
const router = express.Router();
const WebhookService = require("../services/webhookService");

const webhookService = new WebhookService(); // Instantiated once

// POST endpoint for handling BlockCypher webhook events
router.post("/receive", async (req, res) => {
  try {
    const eventData = req.body;
    await webhookService.handleWebhook(eventData);
    res.status(200).send("Event processed successfully");
  } catch (error) {
    console.error("Error processing BlockCypher event:", error);
    res.status(500).send("Error processing event");
  }
});

// Additional webhook-related routes can be added here as needed

module.exports = router;
