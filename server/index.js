require("dotenv").config();

const express = require("express");
const eventRoutes = require("./routes/eventRoutes");
const blockcypherRoutes = require("./routes/blockcypherRoutes");
const { connectToDB } = require("./utils/database");

const app = express();
const port = process.env.PORT || 3000;

// Enable JSON parsing for incoming requests
app.use(express.json());

// Establish database connection
connectToDB();

// Setup routes
app.use("/event", eventRoutes);
app.use("/blockcypher", blockcypherRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.send("Welcome to SatoshiShowdown Server!");
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
