/**
 * @fileoverview Database Utility for Satoshi Showdown.
 * Manages MongoDB database connection using Mongoose.
 * Handles connection and disconnection processes, ensuring robust database interactions.
 */

const mongoose = require("mongoose");
const log = require("./logUtil");

/**
 * Connects to the MongoDB Database.
 * @returns {Promise<void>}
 * @throws {Error} If the MongoDB URI is not defined or connection fails.
 */
const connectDatabase = async () => {
  try {
    const dbURI = process.env.MONGODB_URI;
    if (!dbURI) {
      throw new Error("MongoDB URI is not defined in environment variables");
    }
    await mongoose.connect(dbURI);
    log.info("Connected to MongoDB Atlas via Mongoose");
  } catch (err) {
    log.error(`Failed to connect to MongoDB Atlas: ${err.message}`);
    throw err;
  }
};

/**
 * Disconnects from the MongoDB Database.
 * @returns {Promise<void>}
 * @throws {Error} If disconnection fails.
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
