/**
 * @fileoverview Routes for managing user operations in Satoshi Showdown.
 * Defines routes for user creation and other user-related operations.
 */

const express = require("express");
const { handleCreateUser } = require("../controllers/userController");

const router = new express.Router();

/**
 * Route to handle user creation.
 * Expects to receive user data in the request body.
 *
 * @route POST /user/create
 * @access Public/Private (depending on your application's requirement)
 */
router.post("/create", handleCreateUser);

module.exports = router;
