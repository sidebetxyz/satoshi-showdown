const mongoose = require("mongoose");

async function connectToDB() {
  const uri = process.env.MONGODB_URI;
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB Atlas via Mongoose");
  } catch (err) {
    console.error("Failed to connect to MongoDB Atlas", err);
    throw err;
  }
}

module.exports = { connectToDB };
