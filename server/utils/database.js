const { MongoClient } = require("mongodb");

let db;

async function connectToDB() {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  try {
    await client.connect();
    db = client.db();
    console.log("Connected to MongoDB Atlas");
  } catch (err) {
    console.error("Failed to connect to MongoDB Atlas", err);
    throw err;
  }
}

function getDB() {
  if (!db) {
    throw new Error("No database connection established");
  }
  return db;
}

module.exports = { connectToDB, getDB };
