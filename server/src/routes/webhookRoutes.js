/**
 * @fileoverview Routes for handling webhook callbacks in Satoshi Showdown.
 * Defines the route for receiving and processing incoming webhook callbacks.
 */

const express = require("express");
const { handleProcessWebhook } = require("../controllers/webhookController");

const router = new express.Router();

/**
 * Route to handle received webhook callbacks.
 * Expects to receive the webhook callback at '/webhook/receive/:uniqueId'.
 *
 * @route POST /webhook/receive/:uniqueId
 * @access Public/Private (depending on your application's requirement)
 */
router.post("/receive/:uniqueId", handleProcessWebhook);

module.exports = router;