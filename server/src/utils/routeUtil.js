/**
 * @fileoverview Route Utility for Satoshi Showdown.
 * This module provides functionality for consolidating and applying route handling
 * in the Express application. It imports route modules for different application
 * functionalities (like users, events, and webhooks) and applies them to the Express application,
 * organizing the routing structure in a central location.
 *
 * @module utils/routeUtil
 * @requires routes/userRoutes - Routing module for user-related endpoints.
 * @requires routes/eventRoutes - Routing module for event-related endpoints.
 * @requires routes/webhookRoutes - Routing module for webhook endpoints.
 */

const userRoutes = require("../routes/userRoutes");
const eventRoutes = require("../routes/eventRoutes");
const webhookRoutes = require("../routes/webhookRoutes");

/**
 * Applies a predefined set of route modules to an Express application.
 * This function simplifies the process of adding routes to the app,
 * ensuring that they are added in a consistent and organized manner.
 *
 * @function applyRoutes
 * @param {express.Application} app - The Express application to which routes will be applied.
 */
const applyRoutes = (app) => {
  app.use("/user", userRoutes);
  app.use("/event", eventRoutes);
  app.use("/webhook", webhookRoutes);
};

module.exports = { applyRoutes };
