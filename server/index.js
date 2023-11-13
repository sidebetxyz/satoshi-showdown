require("dotenv").config();

const express = require("express");
const walletRoutes = require("./routes/walletRoutes");
const { connectToDB } = require("./utils/database");

const app = express();
const port = process.env.PORT || 3000;

// Enable JSON parsing for incoming requests
app.use(express.json());

// Establish database connection
connectToDB()
  .then(() => {
    console.log(`Connected to MongoDB Atlas via Mongoose`);
  })
  .catch((err) => {
    console.error("Database connection failed", err);
  });

// Setup routes
app.use("/wallet", walletRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.send("Welcome to SatoshiShowdown Server!");
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
