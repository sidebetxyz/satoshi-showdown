/**
 * @fileoverview Routes for Webhook Handling in Satoshi Showdown.
 * This module defines the Express route for receiving and processing incoming
 * webhook callbacks, particularly for blockchain-related events.
 *
 * @module routes/webhookRoutes
 * @requires express - Express framework to define routes.
 * @requires controllers/webhookController - Controller functions for handling webhook callbacks.
 */

const express = require("express");
const { handleProcessWebhook } = require("../controllers/webhookController");

const router = new express.Router();

/**
 * POST route for receiving webhook callbacks.
 * Configured to receive webhook callbacks at a specified endpoint, identified by a unique ID.
 * The handleProcessWebhook controller function is invoked to process the incoming data.
 * This route is critical for real-time updates and processing of blockchain event notifications.
 *
 * @name post/receive
 * @function
 * @memberof module:routes/webhookRoutes
 * @inner
 * @param {string} path - Express path with unique ID as a parameter for identifying the webhook source.
 * @param {callback} middleware - Express middleware (controller function).
 * @access Public/Private (depending on your application's requirement)
 */
router.post("/receive/:uniqueId", handleProcessWebhook);

module.exports = router;
