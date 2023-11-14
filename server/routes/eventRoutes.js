const express = require("express");
const router = express.Router();
const eventService = require("../services/eventService");

router.post("/create", async (req, res) => {
  try {
    const newEvent = await eventService.createEvent(req.body);
    res.status(201).json(newEvent);
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).send("Error creating event");
  }
});

// Other routes...

module.exports = router;
