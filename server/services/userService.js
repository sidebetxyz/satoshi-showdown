/**
 * @fileoverview Service for managing user operations in Satoshi Showdown.
 * Provides functionalities for user registration, profile retrieval and updates,
 * and handles guest user creation.
 */

const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const { ValidationError, NotFoundError } = require('../utils/errorUtil');
const { v4: uuidv4 } = require('uuid');

/**
 * Registers a new user or creates a guest user profile.
 * 
 * @param {Object} userData - Data for creating a new user.
 * @param {boolean} [isGuest=false] - Flag indicating if the user is a guest.
 * @returns {Promise<Object>} The created user object without sensitive data.
 * @throws {ValidationError} If the username already exists (for non-guest users).
 */
const createUser = async (userData, isGuest = false) => {
    if (!isGuest && await usernameExists(userData.username)) {
        throw new ValidationError('Username already exists');
    }

    const user = new User({
        ...userData,
        uniqueIdentifier: userData.uniqueIdentifier || uuidv4(),
        role: isGuest ? 'participant' : userData.role,
    });

    if (!isGuest) {
        user.passwordHash = await bcrypt.hash(userData.password, 10);
    }

    await user.save();
    return excludeSensitiveData(user);
};

/**
 * Retrieves or creates a user ID based on the request object.
 * 
 * @param {Request} req - The express request object.
 * @returns {Promise<string>} The user ID.
 */
const getOrCreateUserId = async (req) => {
    if (req.user && req.user._id) {
        return req.user._id;
    } else {
        const guestUserData = {
            username: `guest_${uuidv4()}`,
            role: 'participant',
            isGuest: true
        };
        const guestUser = await createUser(guestUserData, true);
        return guestUser._id;
    }
};

// ... Other methods: getUserById, updateUser, usernameExists, excludeSensitiveData

module.exports = {
    createUser,
    getOrCreateUserId,
    // ... Export other methods as needed
};
