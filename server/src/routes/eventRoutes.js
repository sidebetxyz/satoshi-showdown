/**
 * @fileoverview Routes for event management in Satoshi Showdown.
 * Defines routes for handling event-related operations such as creating, updating,
 * deleting, and retrieving events.
 */

const express = require("express");
const {
  handleCreateEvent,
  handleUpdateEvent,
  handleDeleteEvent,
  handleGetEvent,
  handleGetAllEvents,
} = require("../controllers/eventController");

const router = new express.Router();

/**
 * Route to create a new event.
 * @route POST /event/create
 * @access Public/Private (depending on your application's requirement)
 */
router.post("/create", handleCreateEvent);

/**
 * Route to update an existing event.
 * @route PUT /event/update/:id
 * @access Public/Private (depending on your application's requirement)
 */
router.put("/update/:id", handleUpdateEvent);

/**
 * Route to delete an event.
 * @route DELETE /event/delete/:id
 * @access Public/Private (depending on your application's requirement)
 */
router.delete("/delete/:id", handleDeleteEvent);

/**
 * Route to get a specific event by ID.
 * @route GET /event/get/:id
 * @access Public/Private (depending on your application's requirement)
 */
router.get("/get/:id", handleGetEvent);

/**
 * Route to get all events.
 * @route GET /event/getAll
 * @access Public/Private (depending on your application's requirement)
 */
router.get("/getAll", handleGetAllEvents);

module.exports = router;
