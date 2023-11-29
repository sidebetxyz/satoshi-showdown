import express from "express";
import WebhookService from "../services/webhookService.js";

const router = express.Router();
const webhookService = new WebhookService();

// POST endpoint for handling webhook events
router.post("/receive/:uniqueId", async (req, res) => {
  try {
    const uniqueId = req.params.uniqueId;
    const eventData = req.body;

    // Pass both unique ID and event data to the handleWebhook method
    await webhookService.handleWebhook(uniqueId, eventData);

    res.status(200).send("Webhook processed successfully");
  } catch (error) {
    console.error("Error processing webhook event:", error);
    res.status(500).send("Error processing event");
  }
});

export default router;
