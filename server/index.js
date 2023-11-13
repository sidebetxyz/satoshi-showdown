require("dotenv").config();

const express = require("express");
const walletRoutes = require("./routes/walletRoutes");
const { connectToDB } = require("./utils/database");

const app = express();
const port = process.env.PORT || 3000;

// Establish database connection
connectToDB()
  .then(() => {
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
  })
  .catch((err) => {
    console.error("Database connection failed", err);
  });
