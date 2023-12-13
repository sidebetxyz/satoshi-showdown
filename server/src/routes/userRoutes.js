/**
 * @fileoverview Routes for User Management in Satoshi Showdown.
 * This module defines the Express routes for handling user-related operations,
 * such as user creation. Each route is mapped to a specific controller function
 * to handle the incoming request.
 *
 * @module routes/userRoutes
 * @requires express - Express framework to define routes.
 * @requires controllers/userController - Controller functions for user operations.
 */

const express = require("express");
const { handleCreateUser } = require("../controllers/userController");

const router = new express.Router();

/**
 * POST route for user creation.
 * Receives user data in the request body and invokes the handleCreateUser
 * controller function to process the user creation operation. Suitable for
 * both registered users and guest user creation based on application requirements.
 *
 * @name post/create
 * @function
 * @memberof module:routes/userRoutes
 * @inner
 * @param {string} path - Express path
 * @param {callback} middleware - Express middleware (controller function).
 * @access Public/Private (depending on your application's requirement)
 */
router.post("/create", handleCreateUser);

module.exports = router;
