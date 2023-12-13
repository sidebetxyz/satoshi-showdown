/**
 * @fileoverview Route Utility for Satoshi Showdown.
 * This module serves as a centralized point for consolidating and applying route handling
 * within the Express application. It is responsible for importing route modules that cater to
 * different functional aspects of the application, such as user management, event handling,
 * and webhook processing. This organization facilitates a modular and maintainable routing structure,
 * ensuring that application routes are systematically structured and easily scalable.
 *
 * This module also includes a health check endpoint for monitoring the application's operational status,
 * which is crucial for ensuring the reliability and availability of the service.
 *
 * @module utils/routeUtil
 * @requires express.Application - Express application to which the routes are applied.
 * @requires routes/userRoutes - Routing module for handling user-related functionalities.
 * @requires routes/eventRoutes - Routing module for managing event-related operations.
 * @requires routes/webhookRoutes - Routing module for processing webhook events.
 */

const userRoutes = require("../routes/userRoutes");
const eventRoutes = require("../routes/eventRoutes");
const webhookRoutes = require("../routes/webhookRoutes");

/**
 * Integrates various route modules into the Express application.
 * This function systematically adds each group of route handlers to the application instance,
 * segregating them based on their functional domain. Additionally, it establishes a health check
 * endpoint, allowing for routine health and performance monitoring of the application.
 *
 * The health check endpoint is a lightweight and responsive route that returns a standard
 * success response, signifying the operational status of the application.
 *
 * @function applyRoutes
 * @param {express.Application} app - The Express application to which routes will be applied.
 */
const applyRoutes = (app) => {
  // User-related routes
  app.use("/user", userRoutes);

  // Event-related routes
  app.use("/event", eventRoutes);

  // Webhook processing routes
  app.use("/webhook", webhookRoutes);

  // Health Check Route
  app.get("/health", (req, res) => {
    // Respond with OK status to indicate that the application is running properly
    res.status(200).send("OK");
  });
};

module.exports = { applyRoutes };
