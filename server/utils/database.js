const mongoose = require("mongoose");
const log = require("./log"); // Assuming you have a logging utility

/**
 * Database Utility
 *
 * Handles the connection and disconnection processes with the MongoDB database.
 * Uses Mongoose for ORM (Object-Relational Mapping) functionalities, providing
 * a straightforward way to interact with MongoDB.
 */

/**
 * Connects to MongoDB using Mongoose.
 * This function will be invoked when the server starts.
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
    throw err; // Rethrow the error for further handling
  }
};

/**
 * Disconnects from MongoDB.
 * This function will be invoked when the server stops or when needed.
 */
const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    log.info("Disconnected from MongoDB Atlas");
  } catch (err) {
    log.error(`Failed to disconnect from MongoDB Atlas: ${err.message}`);
    throw err; // Rethrow the error for further handling
  }
};

module.exports = { connectToDB, disconnectDB };
