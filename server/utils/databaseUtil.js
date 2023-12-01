// databaseUtil.js
/**
 * Database Utility for Satoshi Showdown
 *
 * Manages MongoDB database connection using Mongoose.
 * Handles connection and disconnection processes, ensuring robust database interactions.
 */

const mongoose = require("mongoose");
const log = require("./logUtil"); // Importing the logging utility

// Connect to MongoDB Database
/**
 * Establishes a connection to the MongoDB database using Mongoose.
 * This function is invoked when the server starts to set up the database connection.
 *
 * @async
 * @function connectToDB
 * @throws {Error} - If the MongoDB URI is not set or the connection attempt fails.
 */
const connectToDB = async () => {
  try {
    const dbURI = process.env.MONGODB_URI;
    if (!dbURI) {
      throw new Error("MongoDB URI is not defined in environment variables");
    }
    await mongoose.connect(dbURI);
    log.info("Connected to MongoDB Atlas via Mongoose");
  } catch (err) {
    log.error(`Failed to connect to MongoDB Atlas: ${err.message}`);
    throw err; // Propagating the error for further handling
  }
};

// Disconnect from MongoDB Database
/**
 * Gracefully closes the connection to the MongoDB database.
 * This function is generally invoked when the server is shutting down.
 *
 * @async
 * @function disconnectDB
 * @throws {Error} - If the disconnection attempt fails.
 */
const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    log.info("Disconnected from MongoDB Atlas");
  } catch (err) {
    log.error(`Failed to disconnect from MongoDB Atlas: ${err.message}`);
    throw err; // Propagating the error for further handling
  }
};

// Exporting the database connection functions
module.exports = { connectToDB, disconnectDB };
