const express = require("express");
const router = express.Router();
const eventService = require("../services/eventService");

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

// Additional event-related routes can be added here as needed

module.exports = router;
