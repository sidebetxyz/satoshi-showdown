/**
 * @fileoverview Controller for managing user operations in Satoshi Showdown.
 * Provides functionality for handling user creation requests.
 * Implements error handling and request validation for user-related API endpoints.
 */

const { createUser } = require('../services/userService');
const log = require('../utils/logUtil');

/**
 * Handles the creation of a new user or a guest user.
 * Extracts user data from the request body and determines if the user is a guest based on the query parameter.
 * Responds with the newly created user data, excluding sensitive information.
 *
 * @param {Request} req - The express request object. Contains user data and query parameters.
 * @param {Response} res - The express response object. Used to send the response to the client.
 * @param {NextFunction} next - The express next middleware function. Used for error handling.
 */
const handleCreateUser = async (req, res, next) => {
    try {
        const userData = req.body;
        const newUser = await createUser(userData);
        res.status(201).json(newUser);
    } catch (err) {
        log.error(`Error in handleCreateUser: ${err.message}`);
        next(err);
    }
};

module.exports = {
    handleCreateUser
};
