// Load environment variables based on the current Node environment
require("dotenv").config({
  path: process.env.NODE_ENV === "development" ? ".env.dev" : ".env.prod",
});

// Core Module Imports
const express = require("express");
const fs = require("fs");
const https = require("https");

// Utility Imports
const { connectToDB } = require("./utils/database");

// Route Imports
const eventRoutes = require("./routes/eventRoutes");
const webhookRoutes = require("./routes/webhookRoutes");

// Middleware Imports
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");

// Initializing Express application
const app = express();

// Server Configuration
// Define the server port
const port = process.env.PORT || 3000;

// Middleware Setup
// Enable JSON parsing for incoming requests
app.use(express.json());

// Logging middleware for development environment
app.use(morgan("dev"));

// Security middleware to set various HTTP headers
app.use(helmet());

// Enable Cross-Origin Resource Sharing
app.use(cors());

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Establishing Database Connection
connectToDB();

// Routing Setup
// Event-related requests are routed to eventRoutes
app.use("/event", eventRoutes);

// Webhook-related requests are routed to webhookRoutes
app.use("/webhook", webhookRoutes);

// HTTPS Server Setup
try {
  // Reading SSL certificate and private key from files
  const privateKey = fs.readFileSync(process.env.SSL_PRIVATE_KEY_PATH, "utf8");
  const certificate = fs.readFileSync(process.env.SSL_CERTIFICATE_PATH, "utf8");
  const credentials = { key: privateKey, cert: certificate };

  // Creating and starting HTTPS server
  const httpsServer = https.createServer(credentials, app);
  httpsServer.listen(port, () => {
    console.log(`Secure server running on https://localhost:${port}`);
  });
} catch (error) {
  console.error("Failed to start HTTPS server:", error.message);
  // Uncomment the below lines to enable an HTTP server as a fallback.
  // app.listen(3001, () => {
  //   console.log(`Insecure server running on http://localhost:3001`);
  // });
}
