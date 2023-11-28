import mongoose from "mongoose";
import log from "./log.js"; // Importing the log utility

/**
 * Establishes a connection to the MongoDB database using Mongoose.
 * This function attempts to connect to the MongoDB Atlas cluster
 * using the URI provided in the environment variables.
 *
 * @async
 * @function connectToDB
 * @throws Will throw an error if the connection fails.
 */
export async function connectToDB() {
  const uri = process.env.MONGODB_URI; // MongoDB connection URI from environment variables

  try {
    await mongoose.connect(uri); // Attempting to connect to MongoDB Atlas
    log.info("Connected to MongoDB Atlas via Mongoose"); // Logging success message on connection
  } catch (err) {
    log.error("Failed to connect to MongoDB Atlas", err); // Logging error on connection failure
    throw err; // Rethrowing the error for upstream handling
  }
}
