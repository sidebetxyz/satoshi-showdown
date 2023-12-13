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

const { createUser } = require("../services/userService");
const log = require("../utils/logUtil");

/**
 * Handles the creation of a new user on the Satoshi Showdown platform.
 * Extracts user data from the request body and utilizes the User Service to create a new user account.
 * Ensures that the response sent back to the client includes the newly created user data, while
 * maintaining data security by excluding sensitive information like passwords. This function is essential
 * for user registration processes, providing a secure and efficient way to add new users to the platform.
 *
 * @async
 * @function handleCreateUser
 * @param {express.Request} req - The Express request object, containing user data for account creation.
 * @param {express.Response} res - The Express response object, used to send back the created user data.
 * @param {express.NextFunction} next - The Express next middleware function, for error handling and propagation.
 * @return {Promise<void>} No explicit return value; the function sends a response to the client.
 * @throws {Error} Propagates any errors encountered during user creation to the error handling middleware.
 */
const handleCreateUser = async (req, res, next) => {
  try {
    const userData = req.body;
    const newUser = await createUser(userData);
    res.status(201).json(newUser);
  } catch (err) {
    log.error(`Error in handleCreateUser: ${err.message}`);
    next(err); // Propagate error to centralized error handling middleware.
  }
};

module.exports = {
  handleCreateUser,
};
