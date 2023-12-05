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
 * Expects a JSON object with user data, including a flag indicating if the user is a guest.
 *
 * @param {Object} userData - Data for creating a new user. Includes username, email, password, and isGuest flag.
 * @returns {Promise<Object>} The created user object without sensitive data.
 * @throws {ValidationError} If user data validation fails or if username/email already exists.
 */
const createUser = async (userData) => {
    try {
        const { error } = validateUser(userData);
        if (error) {
            throw new ValidationError(error.details.map(d => d.message).join('; '));
        }

        if (!userData.isGuest && await checkUserExists(userData.username, userData.email)) {
            throw new ValidationError('Username or email already exists');
        }

        const newUser = new User({
            ...userData,
            role: userData.isGuest ? 'participant' : userData.role,
            passwordHash: userData.isGuest ? undefined : await bcrypt.hash(userData.password, 10)
        });

        await newUser.save();

        const userDataWithoutSensitiveInfo = excludeSensitiveData(newUser);
        log.info(`User created: ${JSON.stringify(userDataWithoutSensitiveInfo)}`);

        return userDataWithoutSensitiveInfo;
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

/**
 * Deletes a user by their ID.
 * 
 * @param {string} userId - The ID of the user to delete.
 * @returns {Promise<void>}
 * @throws {NotFoundError} If the user is not found.
 */
const deleteUser = async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new NotFoundError(`User with ID ${userId} not found`);
    }

    await user.remove();
    log.info(`User with ID ${userId} deleted successfully`);
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
    const userCount = await User.countDocuments({ $or: [{ username }, { email }] });
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

module.exports = {
    createUser,
    getUserById,
    getUserByUsername,
    getUserByEmail,
    getUserByIP,
    getAllUsers,
    updateUser,
    deleteUser
};
