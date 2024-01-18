/**
 * @fileoverview User Controller for Satoshi Showdown.
 * This controller manages HTTP requests related to user operations, primarily focusing on user creation.
 * It handles incoming requests on user-related endpoints, ensuring proper validation, error handling,
 * and interaction with the User Service for processing user data. The controller plays a pivotal role
 * in maintaining the integrity and security of user information while facilitating user account management
 * functionalities such as registration and data retrieval.
 *
 * @module controllers/userController
 * @requires services/userService - Service layer responsible for handling user-related business logic.
 * @requires utils/logUtil - Logging utility used for recording errors and other significant application events.
 */

const { registerUser, loginUser } = require("../services/userService");
const log = require("../utils/logUtil");

// Handle user registration.
const handleRegisterUser = async (req, res, next) => {
  try {
    const userData = req.body;
    const newUser = await registerUser(userData);
    res.status(201).json(newUser);
  } catch (err) {
    log.error(`Error in handleRegisterUser: ${err.message}`);
    next(err);
  }
};

// Handle user login.
const handleLoginUser = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const loginResponse = await loginUser(username, password);
    res.status(200).json(loginResponse);
  } catch (err) {
    log.error(`Error in handleLogin: ${err.message}`);
    next(err);
  }
};

module.exports = {
  handleRegisterUser,
  handleLoginUser,
};
