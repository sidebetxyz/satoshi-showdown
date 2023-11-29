import mongoose from "mongoose";
import log from "./log.js"; // Import the log utility

/**
 * Establishes and manages the connection to the MongoDB database.
 * This module uses Mongoose for Object Data Modeling (ODM) to interact with MongoDB.
 */

/**
 * Establishes a connection to the MongoDB database using Mongoose.
 * Attempts to connect to the MongoDB Atlas cluster with the URI provided in the environment variables.
 *
 * @async
 * @function connectToDB
 * @throws Will throw an error if the connection to the database fails.
 */
export async function connectToDB() {
  try {
    const uri = process.env.MONGODB_URI; // MongoDB connection URI
    await mongoose.connect(uri); // Attempt to establish a connection
    log.info("Connected to MongoDB Atlas via Mongoose"); // Log success message
  } catch (err) {
    log.error("Failed to connect to MongoDB Atlas", err); // Log error message
    throw err; // Propagate the error
  }
}

/**
 * Disconnects from the MongoDB database.
 * Ensures a graceful shutdown of the database connection when the application stops.
 *
 * @async
 * @function disconnectDB
 */
export async function disconnectDB() {
  try {
    await mongoose.disconnect(); // Attempt to close the MongoDB connection
    log.info("Disconnected from MongoDB Atlas"); // Log success message
  } catch (err) {
    log.error("Failed to disconnect from MongoDB Atlas", err); // Log error message
    throw err; // Propagate the error
  }
}
