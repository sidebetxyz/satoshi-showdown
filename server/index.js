require("dotenv").config();

const express = require("express");
const eventRoutes = require("./routes/eventRoutes"); // Import event routes
const { connectToDB } = require("./utils/database");

const app = express();
const port = process.env.PORT || 3000;

// Enable JSON parsing for incoming requests
app.use(express.json());

// Establish database connection
connectToDB();

// Setup routes for events
app.use("/event", eventRoutes); // Setup event routes

// Root endpoint
app.get("/", (req, res) => {
  res.send("Welcome to SatoshiShowdown Server!");
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
