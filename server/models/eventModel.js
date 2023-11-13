const { getDB } = require("../utils/database");

const eventSchema = {
  // Common Attributes
  id: String, // Unique identifier for the event
  name: String,
  description: String,
  type: String, // e.g., matchup, contest, competition, wager
  entryFee: Number,
  startTime: Date,
  endTime: Date,
  status: String, // e.g., pending, active, completed
  participants: Array, // List of participant identifiers

  // Specific Attributes based on type
  // Add any additional fields that are specific to certain types of events
};

function EventModel() {
  const db = getDB();
  return db.collection("events").withConverter(eventConverter); // Assuming you're using a converter for schema enforcement
}

const eventConverter = {
  // Implement methods to convert to/from database format if needed
};

module.exports = EventModel;
