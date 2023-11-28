import dotenv from "dotenv";
import express from "express";
import fs from "fs";
import https from "https";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import { connectToDB } from "./utils/database.js";
import log from "./utils/log.js";
import eventRoutes from "./routes/eventRoutes.js";
import webhookRoutes from "./routes/webhookRoutes.js";

// Load environment variables based on the Node environment
dotenv.config({
  path: process.env.NODE_ENV === "development" ? ".env.dev" : ".env.prod",
});

// Initialize Express application
const app = express();

// Define server port (default to 3000 if not specified)
const port = process.env.PORT || 3000;

// Middleware setup
app.use(express.json()); // Parse JSON request bodies
app.use(morgan("dev")); // Log HTTP requests
app.use(helmet()); // Secure app by setting various HTTP headers
app.use(cors()); // Enable CORS

// Database connection
connectToDB();

// API routing
app.use("/event", eventRoutes); // Event management routes
app.use("/webhook", webhookRoutes); // Webhook processing routes

// Global error handling
app.use((err, req, res, next) => {
  log.error(err.stack); // Log error
  res.status(500).send("Something broke!"); // Send generic error response
});

try {
  // HTTPS server setup
  const privateKey = fs.readFileSync(process.env.SSL_PRIVATE_KEY_PATH, "utf8");
  const certificate = fs.readFileSync(process.env.SSL_CERTIFICATE_PATH, "utf8");
  const credentials = { key: privateKey, cert: certificate };
  const httpsServer = https.createServer(credentials, app);

  // Start server
  httpsServer.listen(port, () => {
    log.info(`Secure server running on https://localhost:${port}`);
  });
} catch (error) {
  log.error("Failed to start HTTPS server:", error.message);
}
