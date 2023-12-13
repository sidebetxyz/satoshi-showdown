/**
 * @fileoverview Database Utility for Satoshi Showdown.
 * Provides functionality for connecting to and disconnecting from a MongoDB database using Mongoose.
 * It ensures robust database interactions and handles potential connection and disconnection issues.
 *
 * @module utils/databaseUtil
 * @requires mongoose - Mongoose library for MongoDB interaction.
 * @requires utils/logUtil - Logging utility for application-wide logging.
 */

const mongoose = require("mongoose");
const log = require("./logUtil");

/**
 * Connects to the MongoDB database.
 * This function attempts to establish a connection to MongoDB using Mongoose
 * based on the provided MongoDB URI in environment variables.
 * Logs the connection status and throws an error if connection fails.
 *
 * @async
 * @function connectDatabase
 * @throws {Error} Throws an error if the MongoDB URI is not defined or if the connection fails.
 * @return {Promise<void>} A promise that resolves when the connection is successful.
 */
const connectDatabase = async () => {
  try {
    const databaseURI = process.env.MONGODB_URI;
    if (!databaseURI) {
      throw new Error("MongoDB URI is not defined in environment variables");
    }
    await mongoose.connect(databaseURI);
    log.info("Connected to MongoDB Atlas via Mongoose");
  } catch (err) {
    log.error(`Failed to connect to MongoDB Atlas: ${err.message}`);
    throw err;
  }
};

/**
 * Disconnects from the MongoDB database.
 * This function closes the existing MongoDB connection using Mongoose.
 * Logs the disconnection status and throws an error if disconnection fails.
 *
 * @async
 * @function disconnectDatabase
 * @throws {Error} Throws an error if the disconnection fails.
 * @return {Promise<void>} A promise that resolves when the disconnection is successful.
 */
const disconnectDatabase = async () => {
  try {
    await mongoose.disconnect();
    log.info("Disconnected from MongoDB Atlas");
  } catch (err) {
    log.error(`Failed to disconnect from MongoDB Atlas: ${err.message}`);
    throw err;
  }
};

module.exports = { connectDatabase, disconnectDatabase };
