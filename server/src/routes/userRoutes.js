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
const {
  handleRegisterUser,
  handleLoginUser,
} = require("../controllers/userController");

const router = new express.Router();

// POST route for user registration.
router.post("/register", handleRegisterUser);

// POST route for user login.
router.post("/login", handleLoginUser);

module.exports = router;
