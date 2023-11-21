const express = require("express");
const router = express.Router();
const WebhookService = require("../services/webhookService");

const webhookService = new WebhookService(); // Instantiated once

// POST endpoint for handling BlockCypher webhook events
// Now includes a path parameter to capture the unique ID
router.post("/receive/:uniqueId", async (req, res) => {
  try {
    const uniqueId = req.params.uniqueId; // Capture the unique ID from the URL
    const eventData = req.body;

    // Pass both unique ID and event data to the handleWebhook method
    await webhookService.handleWebhook(uniqueId, eventData);

    res.status(200).send("Event processed successfully");
  } catch (error) {
    console.error("Error processing BlockCypher event:", error);
    res.status(500).send("Error processing event");
  }
});

// Additional webhook-related routes can be added here as needed

module.exports = router;
