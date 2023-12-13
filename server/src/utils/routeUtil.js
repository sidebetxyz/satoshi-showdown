/**
 * @fileoverview Route utility for Satoshi Showdown.
 * Consolidates the application's route handling by importing all route modules
 * and applying them to the Express application.
 *
 * @requires routes/userRoutes: Routing module for user-related endpoints.
 * @requires routes/eventRoutes: Routing module for event-related endpoints.
 * @requires routes/webhookRoutes: Routing module for webhook endpoints.
 */

const userRoutes = require("../routes/userRoutes");
const eventRoutes = require("../routes/eventRoutes");
const webhookRoutes = require("../routes/webhookRoutes");

/**
 * Applies all route modules to the provided Express application.
 *
 * @param {Express} app - The Express application to which routes will be applied.
 */
const applyRoutes = (app) => {
  app.use("/user", userRoutes);
  app.use("/event", eventRoutes);
  app.use("/webhook", webhookRoutes);
};

module.exports = { applyRoutes };
