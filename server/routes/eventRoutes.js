import express from "express";
import EventService from "../services/eventService.js";

const router = express.Router();
const eventService = new EventService();

// Route to create a new event
router.post("/create", async (req, res) => {
  try {
    const eventData = req.body;
    const newEvent = await eventService.createEvent(eventData);
    res.status(201).json(newEvent);
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).send("Error creating event");
  }
});

// Route to get an event by its publicId
router.get("/:publicId", async (req, res) => {
  try {
    const publicId = req.params.publicId;
    const event = await eventService.getEventByPublicId(publicId);
    res.status(200).json(event);
  } catch (error) {
    console.error("Error retrieving event:", error);
    res.status(500).send("Error retrieving event");
  }
});

// Route to join an event
router.post("/:publicId/join", async (req, res) => {
  try {
    const publicId = req.params.publicId;
    const participantData = req.body;
    const event = await eventService.joinEvent(publicId, participantData);
    res.status(200).json(event);
  } catch (error) {
    console.error("Error joining event:", error);
    res.status(500).send("Error joining event");
  }
});

export default router;
