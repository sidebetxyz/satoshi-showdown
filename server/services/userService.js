/**
 * @fileoverview Service for managing user operations in Satoshi Showdown.
 * Provides functionalities for user registration, profile retrieval and updates,
 * and accommodates both registered and guest users.
 */

const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const { validateUser } = require('../utils/validationUtil');
const { ValidationError, NotFoundError } = require('../utils/errorUtil');
const log = require('../utils/logUtil');

/**
 * Registers a new user or creates a guest user profile.
 * 
 * @param {Object} userData - Data for creating a new user.
 * @param {boolean} [isGuest=false] - Indicates if the user is a guest.
 * @returns {Promise<Object>} The created user object without sensitive data.
 * @throws {ValidationError} If the username or email already exists.
 */
const createUser = async (userData, isGuest = false) => {
    try {
        // Validate user data
        const { error } = validateUser(userData);
        if (error) {
            throw new ValidationError(error.details.map(d => d.message).join('; '));
        }

        // Check for existing username or email
        if (!isGuest && await checkUserExists(userData.username, userData.email)) {
            throw new ValidationError('Username or email already exists');
        }

        // Hash password for non-guest users
        if (!isGuest) {
            userData.passwordHash = await bcrypt.hash(userData.password, 10);
        }

        // Create and save the user
        const newUser = new User({ ...userData, role: isGuest ? 'participant' : userData.role });
        await newUser.save();
        return excludeSensitiveData(newUser);
    } catch (err) {
        log.error(`Error in createUser: ${err.message}`);
        throw err;
    }
};

/**
 * Retrieves a user by their ID.
 * 
 * @param {string} userId - The ID of the user to retrieve.
 * @returns {Promise<Object>} The user object.
 * @throws {NotFoundError} If the user is not found.
 */
const getUserById = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new NotFoundError(`User with ID ${userId} not found`);
    }
    return excludeSensitiveData(user);
};

/**
 * Checks if a username or email already exists in the database.
 * This is a private function used internally by the user service.
 * 
 * @param {string} username - The username to check.
 * @param {string} email - The email to check.
 * @returns {Promise<boolean>} True if the username or email exists, false otherwise.
 * @private
 */
async function checkUserExists(username, email) {
    const userCount = await User.countDocuments({
        $or: [{ username }, { email }]
    });
    return userCount > 0;
}

/**
 * Excludes sensitive data from the user object.
 * This is a private function used internally by the user service.
 * 
 * @param {User} user - The user object.
 * @returns {Object} The user object without sensitive data.
 * @private
 */
const excludeSensitiveData = (user) => {
    const { passwordHash, ...userData } = user.toObject();
    return userData;
};

/**
 * Retrieves a user by their username.
 * 
 * @param {string} username - The username of the user to retrieve.
 * @returns {Promise<Object>} The user object.
 * @throws {NotFoundError} If the user is not found.
 */
const getUserByUsername = async (username) => {
    const user = await User.findOne({ username });
    if (!user) {
        throw new NotFoundError(`User with username ${username} not found`);
    }
    return excludeSensitiveData(user);
};

/**
 * Retrieves a user by their email.
 * 
 * @param {string} email - The email of the user to retrieve.
 * @returns {Promise<Object>} The user object.
 * @throws {NotFoundError} If the user is not found.
 */
const getUserByEmail = async (email) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new NotFoundError(`User with email ${email} not found`);
    }
    return excludeSensitiveData(user);
};

/**
 * Retrieves a user by their IP address.
 * 
 * @param {string} ipAddress - The IP address of the user to retrieve.
 * @returns {Promise<Object>} The user object.
 * @throws {NotFoundError} If the user is not found.
 */
const getUserByIP = async (ipAddress) => {
    const user = await User.findOne({ ipAddress });
    if (!user) {
        throw new NotFoundError(`User with IP address ${ipAddress} not found`);
    }
    return excludeSensitiveData(user);
};

/**
 * Retrieves all users.
 * 
 * @returns {Promise<Array<Object>>} An array of all user objects.
 */
const getAllUsers = async () => {
    const users = await User.find({});
    return users.map(excludeSensitiveData);
};

/**
 * Updates an existing user.
 * 
 * @param {string} userId - The ID of the user to update.
 * @param {Object} updateData - Data for updating the user.
 * @returns {Promise<Object>} The updated user object.
 * @throws {NotFoundError} If the user is not found.
 */
const updateUser = async (userId, updateData) => {
    const user = await User.findByIdAndUpdate(userId, updateData, { new: true });
    if (!user) {
        throw new NotFoundError(`User with ID ${userId} not found`);
    }
    return excludeSensitiveData(user);
};

module.exports = {
    createUser,
    getUserById,
    getUserByUsername,
    getUserByEmail,
    getUserByIP,
    getAllUsers,
    updateUser
};
