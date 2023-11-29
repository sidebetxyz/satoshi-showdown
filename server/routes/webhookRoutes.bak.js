import express from "express";
import WebhookService from "../services/webhookService.js";

const router = express.Router();
const webhookService = new WebhookService();

router.post("/receive/:uniqueId", async (req, res) => {
  try {
    const { uniqueId } = req.params;
    const eventData = req.body;

    await webhookService.handleWebhook(uniqueId, eventData);
    res.status(200).send("Event processed successfully");
  } catch (error) {
    res.status(500).send("Error processing event");
  }
});

export default router;
