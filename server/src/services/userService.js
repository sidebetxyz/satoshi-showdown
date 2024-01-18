/**
 * @fileoverview Service for managing user operations in Satoshi Showdown.
 * This service provides comprehensive functionalities for user management, including
 * registration, authentication, profile retrieval, and updates. It caters to both
 * registered and guest users, playing a critical role in user data management and ensuring
 * secure and efficient operations within the application. The service interacts with the
 * user data model and utilizes various utilities for validation, encryption, and logging.
 *
 * @module services/userService
 * @requires models/userModel - User data model for database interactions.
 * @requires bcrypt - Library for hashing passwords.
 * @requires utils/validationUtil - Utility for validating user data.
 * @requires utils/errorUtil - Custom error classes for consistent error handling.
 * @requires utils/logUtil - Logging utility for application-wide logging.
 */

const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validateUser } = require("../utils/validationUtil");
const { ValidationError, NotFoundError } = require("../utils/errorUtil");
const log = require("../utils/logUtil");

// Register User
const registerUser = async (userData) => {
  // Validate user data
  const { error } = validateUser(userData);
  if (error) {
    throw new ValidationError(error.details.map((d) => d.message).join("; "));
  }

  // Check if user already exists
  if (
    await User.findOne({
      $or: [{ username: userData.username }, { email: userData.email }],
    })
  ) {
    throw new ValidationError("Username or email already exists");
  }

  // Hash password
  const passwordHash = await bcrypt.hash(userData.password, 10);

  // Create new user
  const newUser = new User({
    ...userData,
    passwordHash,
  });

  await newUser.save();

  // Exclude sensitive data before returning
  return excludeSensitiveData(newUser);
};

// Login User
const loginUser = async (username, password) => {
  const user = await User.findOne({ username });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new Error("Invalid username or password");
  }

  const token = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  return { token };
};

/**
 * Retrieves a user's data by their unique ID.
 * Essential for profile management, authentication, and accessing user-specific data within the application.
 *
 * @async
 * @function getUserById
 * @param {string} userId - The unique ID of the user to retrieve.
 * @return {Promise<Object>} The user object with sensitive data excluded.
 * @throws {NotFoundError} If no user is found with the provided ID.
 */
const getUserById = async (userId) => {
  const user = await User.findOne({ userId });

  if (!user) {
    throw new NotFoundError(`User with ID ${userId} not found`);
  }

  return user;
};

/**
 * Retrieves a user's data by their username.
 * Used for operations like login, where the username is a key identifier.
 *
 * @async
 * @function getUserByUsername
 * @param {string} username - The username of the user to retrieve.
 * @return {Promise<Object>} The user object with sensitive data excluded.
 * @throws {NotFoundError} If no user is found with the provided username.
 */
const getUserByUsername = async (username) => {
  const user = await User.findOne({ username });

  if (!user) {
    throw new NotFoundError(`User with username ${username} not found`);
  }

  return excludeSensitiveData(user);
};

/**
 * Retrieves a user's data by their email.
 * Critical for processes like password recovery or email-based authentication.
 *
 * @async
 * @function getUserByEmail
 * @param {string} email - The email of the user to retrieve.
 * @return {Promise<Object>} The user object with sensitive data excluded.
 * @throws {NotFoundError} If no user is found with the provided email.
 */
const getUserByEmail = async (email) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new NotFoundError(`User with email ${email} not found`);
  }

  return excludeSensitiveData(user);
};

/**
 * Retrieves a user's data by their IP address.
 * Useful for tracking guest users or for security and auditing purposes.
 *
 * @async
 * @function getUserByIP
 * @param {string} ipAddress - The IP address of the user to retrieve.
 * @return {Promise<Object>} The user object with sensitive data excluded.
 * @throws {NotFoundError} If no user is found with the provided IP address.
 */
const getUserByIP = async (ipAddress) => {
  const user = await User.findOne({ ipAddress });

  if (!user) {
    throw new NotFoundError(`User with IP address ${ipAddress} not found`);
  }

  return excludeSensitiveData(user);
};

/**
 * Retrieves all users registered in the system.
 * Typically used for administrative and reporting purposes, providing a comprehensive view of the user base.
 *
 * @async
 * @function getAllUsers
 * @return {Promise<Array<Object>>} An array of user objects with sensitive data excluded.
 */
const getAllUsers = async () => {
  const users = await User.find({});
  return users.map(excludeSensitiveData);
};

/**
 * Updates the details of an existing user based on their ID.
 * Allows modification of user information like contact details, preferences, and other profile data.
 *
 * @async
 * @function updateUser
 * @param {string} userId - The unique ID of the user to update.
 * @param {Object} updateData - Data containing the updates for the user.
 * @param {string} updateData.username - Updated username of the user.
 * @param {string} updateData.email - Updated email address of the user.
 * @param {string} updateData.password - Updated hashed password for security purposes.
 * @param {Date} updateData.lastActive - Updated timestamp of the user's last activity.
 * @param {string} updateData.role - Updated role of the user within the platform.
 * @param {Object} updateData.profileInfo - Updated additional profile information (structure can vary).
 * @param {string} updateData.ipAddress - Updated IP address of the user.
 * @param {ObjectID} updateData.organization - Updated reference to an Organization, if applicable.
 * @param {Array} updateData.eventsCreated - Updated events created by the user.
 * @param {Array} updateData.eventsParticipated - Updated events in which the user has participated.
 * @param {Array} updateData.transactions - Updated transactions associated with the user.
 * @return {Promise<Object>} The updated user object with sensitive data (e.g., password hash) excluded.
 * @throws {NotFoundError} If no user is found with the provided ID.
 */
const updateUser = async (userId, updateData) => {
  const user = await User.findByIdAndUpdate(userId, updateData, { new: true });

  if (!user) {
    throw new NotFoundError(`User with ID ${userId} not found`);
  }

  return excludeSensitiveData(user);
};

/**
 * Deletes a user from the system based on their unique ID.
 * Essential for account management, data privacy compliance, and user-requested account deletion.
 *
 * @async
 * @function deleteUser
 * @param {string} userId - The unique ID of the user to delete.
 * @return {Promise<void>} Indicates successful deletion of the user.
 * @throws {NotFoundError} If no user is found with the provided ID.
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
 * Used internally to prevent duplicate user registrations.
 *
 * @private
 * @async
 * @function checkUserExists
 * @param {string} username - The username to check for existence.
 * @param {string} email - The email to check for existence.
 * @return {Promise<boolean>} True if the username or email exists, false otherwise.
 */
async function checkUserExists(username, email) {
  const userCount = await User.countDocuments({
    $or: [{ username }, { email }],
  });

  return userCount > 0;
}

/**
 * Excludes sensitive data from the user object before returning it.
 * Ensures that information like password hashes is not exposed outside the service.
 *
 * @private
 * @function excludeSensitiveData
 * @param {User} user - The user object to sanitize.
 * @return {Object} The user object without sensitive data.
 */
const excludeSensitiveData = (user) => {
  const userObject = user.toObject();
  delete userObject.passwordHash;
  delete userObject.__v;
  delete userObject.lastActive;
  delete userObject.createdAt;
  delete userObject.updatedAt;
  delete userObject._id;
  delete userObject.ipAddress;
  return userObject;
};

module.exports = {
  registerUser,
  loginUser,
  getUserById,
  getUserByUsername,
  getUserByEmail,
  getUserByIP,
  getAllUsers,
  updateUser,
  deleteUser,
};
