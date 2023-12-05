/**
 * @fileoverview Controller for managing user operations in Satoshi Showdown.
 * Provides functionality for handling user creation requests.
 */

const { createUser } = require('../services/userService');
const log = require('../utils/logUtil');

/**
 * Handles the creation of a new user or a guest user.
 * 
 * @param {Request} req - The express request object.
 * @param {Response} res - The express response object.
 * @param {NextFunction} next - The express next middleware function.
 */
const handleCreateUser = async (req, res, next) => {
    try {
        const userData = req.body;
        const isGuest = req.query.isGuest || false;
        const newUser = await createUser(userData, isGuest, req);
        res.status(201).json(newUser);
    } catch (err) {
        log.error(`Error in handleCreateUser: ${err.message}`);
        next(err);
    }
};

module.exports = {
    handleCreateUser
};
