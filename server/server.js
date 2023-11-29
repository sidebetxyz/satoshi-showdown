// Import necessary modules
import dotenv from "dotenv";
import express from "express";
import fs from "fs";
import https from "https";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";

// Import custom utilities
import { connectToDB, disconnectDB } from "./utils/database.js";
import log from "./utils/log.js";

// Import route handlers
import eventRoutes from "./routes/eventRoutes.js";
import webhookRoutes from "./routes/webhookRoutes.js";

// Configure environment variables
dotenv.config({
  path: process.env.NODE_ENV === "development" ? ".env.dev" : ".env.prod",
});

// Initialize the Express application
const app = express();

// Apply middleware for enhanced security and logging
app.use(express.json()); // Parse JSON request bodies
app.use(morgan("dev")); // Log HTTP requests
app.use(helmet()); // Set secure HTTP headers
app.use(cors()); // Enable CORS for cross-origin requests

// Establish a database connection
connectToDB();

// Define a root route for basic server checks
app.get("/", (req, res) => {
  res.status(200).send("Server is running");
});

// Configure API routes
app.use("/event", eventRoutes);
app.use("/webhook", webhookRoutes);

// Global error handling middleware
app.use((err, req, res, next) => {
  log.error(err.stack); // Log the error stack
  res.status(500).send("Something broke!"); // Send generic error response
});

let httpsServer;

// Start the HTTPS server if not in test mode
if (process.env.NODE_ENV !== "test") {
  const port = process.env.PORT || 3000;
  try {
    // Load SSL credentials
    const privateKey = fs.readFileSync(
      process.env.SSL_PRIVATE_KEY_PATH,
      "utf8"
    );
    const certificate = fs.readFileSync(
      process.env.SSL_CERTIFICATE_PATH,
      "utf8"
    );
    const credentials = { key: privateKey, cert: certificate };
    httpsServer = https.createServer(credentials, app);

    httpsServer.listen(port, () => {
      log.info(`Server running on https://localhost:${port}`);
    });
  } catch (error) {
    log.error("Failed to start HTTPS server:", error.message);
  }
}

// Export the Express app and a function to close the server and database
export default app;
export const closeServer = async () => {
  if (httpsServer) {
    httpsServer.close();
  }
  // Disconnect from the database
  await disconnectDB();
};
