/**
 * @fileoverview Server Initialization Utility for Satoshi Showdown.
 * Responsible for initializing and configuring the Express application.
 * This includes applying centralized middleware, setting up routes, and configuring error handling,
 * thus preparing the Express server for robust operation.
 *
 * @module utils/serverUtil
 * @requires express - Express framework for building the server.
 * @requires utils/middlewareUtil - Utility for applying a set of middleware to the Express application.
 * @requires utils/routeUtil - Utility for setting up routes in the Express application.
 */

const express = require("express");
const { applyMiddlewares } = require("./middlewareUtil");
const { applyRoutes } = require("./routeUtil");

/**
 * Initializes and configures the Express application.
 * Applies middleware, sets up routes, and ensures comprehensive error handling.
 *
 * @function initializeServer
 * @return {express.Application} The fully configured Express application.
 */
const initializeServer = () => {
  const app = express();

  // Apply middleware to the app
  applyMiddlewares(app);

  // Set up routes
  applyRoutes(app);

  return app;
};

module.exports = { initializeServer };
