const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  type: { type: String, required: true }, // e.g., matchup, contest, competition, wager
  entryFee: { type: Number, required: true },
  startTime: { type: Date, required: true },
  endTime: Date,
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Assuming you have a User model
  // You can add additional fields as needed
});

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
