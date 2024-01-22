/**
 * @fileoverview Routes for Event Management in Satoshi Showdown.
 * This module defines the Express routes for handling event-related operations
 * such as creating, updating, deleting, and retrieving events. Each route is
 * associated with a specific controller function to handle the request.
 * These routes are integral to the application's RESTful API, allowing clients
 * to interact with event data stored in the backend system.
 *
 * @module routes/eventRoutes
 * @requires express - Express framework to define routes.
 * @requires controllers/eventController - Controller functions for event operations.
 */

const express = require("express");
const authenticate = require("../middlewares/jwtAuthenticateMiddleware");
const {
  handleCreateEvent,
  handleUpdateEvent,
  handleDeleteEvent,
  handleGetEvent,
  handleGetAllEvents,
  handleJoinEvent,
  handleSettleEvent,
  handleCastVote,
  handleRefundEventCreator,
} = require("../controllers/eventController");

const router = new express.Router();

/**
 * POST route to create a new event in the system.
 * This route invokes the handleCreateEvent controller to process the event creation request.
 * It expects the event data to be provided in the request body, typically including details
 * like event name, date, location, and other relevant information.
 *
 * @name post/create
 * @function
 * @memberof module:routes/eventRoutes
 * @inner
 * @param {string} path - Express path.
 * @param {callback} middleware - Express middleware (controller function).
 * @access Public/Private (depending on your application's requirement)
 */
router.post("/create", authenticate, handleCreateEvent);

/**
 * PUT route to update an existing event identified by its ID.
 * This route calls the handleUpdateEvent controller to handle the event update request.
 * The event ID is expected as a URL parameter, and the updated event data should be
 * provided in the request body.
 *
 * @name put/update
 * @function
 * @memberof module:routes/eventRoutes
 * @inner
 * @param {string} path - Express path with event ID as a parameter.
 * @param {callback} middleware - Express middleware (controller function).
 * @access Public/Private (depending on your application's requirement)
 */
router.put("/update/:id", handleUpdateEvent);

/**
 * DELETE route to remove an event from the system based on its ID.
 * This route utilizes the handleDeleteEvent controller to process the event deletion request.
 * The event ID to delete is expected as a URL parameter.
 *
 * @name delete/delete
 * @function
 * @memberof module:routes/eventRoutes
 * @inner
 * @param {string} path - Express path with event ID as a parameter.
 * @param {callback} middleware - Express middleware (controller function).
 * @access Public/Private (depending on your application's requirement)
 */
router.delete("/delete/:id", handleDeleteEvent);

/**
 * GET route to retrieve detailed information about a specific event by its ID.
 * This route uses the handleGetEvent controller to fetch and return the requested event data.
 * The event ID is expected as a URL parameter, and the route returns the full details
 * of the specified event if found.
 *
 * @name get/get
 * @function
 * @memberof module:routes/eventRoutes
 * @inner
 * @param {string} path - Express path with event ID as a parameter.
 * @param {callback} middleware - Express middleware (controller function).
 * @access Public/Private (depending on your application's requirement)
 */
router.get("/get/:id", handleGetEvent);

/**
 * GET route to retrieve a list of all events in the system.
 * This route calls the handleGetAllEvents controller to fetch and return data for all events.
 * It is typically used to display an overview of events or for administrative purposes.
 *
 * @name get/getAll
 * @function
 * @memberof module:routes/eventRoutes
 * @inner
 * @param {string} path - Express path.
 * @param {callback} middleware - Express middleware (controller function).
 * @access Public/Private (depending on your application's requirement)
 */
router.get("/getAll", handleGetAllEvents);

/**
 * POST route for a user to join an event.
 * Expects event and user IDs in the request body.
 *
 * @name post/join
 * @function
 * @memberof module:routes/eventRoutes
 * @inner
 * @param {string} path - Express path.
 * @param {callback} middleware - Express middleware (controller function).
 * @access Public/Private (as required)
 */
router.post("/join", authenticate, handleJoinEvent);

/**
 * POST route to settle an event.
 * Expects the event ID as a URL parameter.
 *
 * @name post/settle
 * @function
 * @memberof module:routes/eventRoutes
 * @inner
 * @param {string} path - Express path with event ID as a parameter.
 * @param {callback} middleware - Express middleware (controller function).
 * @access Public/Private (as required)
 */
router.post("/settle/:eventId", authenticate, handleSettleEvent);

/**
 * POST route to cast a vote for a user.
 * Expects the user ID and vote data in the request body.
 *
 * @name post/vote
 * @function
 * @memberof module:routes/eventRoutes
 * @inner
 * @param {string} path - Express path.
 * @param {callback} middleware - Express middleware (controller function).
 * @access Public/Private (as required)
 */
router.post("/vote", authenticate, handleCastVote);

/**
 * POST route to process a refund for the creator of an event.
 * Expects the event ID as a URL parameter.
 *
 * @name post/refund
 * @function
 * @memberof module:routes/eventRoutes
 * @inner
 * @param {string} path - Express path with event ID as a parameter.
 * @param {callback} middleware - Express middleware (controller function).
 * @access Public/Private (as required)
 */
router.post("/refund/:eventId", handleRefundEventCreator);

module.exports = router;
