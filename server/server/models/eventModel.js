// Importing Mongoose library for database interactions
const mongoose = require("mongoose");

/**
 * Event Model for Satoshi Showdown
 *
 * Manages the lifecycle and properties of events within the platform.
 * The schema defines the structure and constraints of event data, including details
 * like organization, participant management, and streaming/betting features.
 */
const eventSchema = new mongoose.Schema({
  // Event name is mandatory
  name: { type: String, required: true },

  // Optional fields for additional event details
  description: String,
  type: String,
  startTime: { type: Date, required: true },
  endTime: Date,
  status: {
    type: String,
    enum: ["planning", "active", "completed"],
    default: "planning",
  },
  readyParticipants: { type: Number, default: 0 },
  activeParticipants: { type: Number, default: 0 },
  maxParticipants: Number,
  entryFee: { type: Number, required: true },
  prizePool: Number,

  // Linking the event creator and participants
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  participants: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    streamingLink: String,
  }],

  // Associating transactions with the event
  transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Transaction" }],

  // Recording event winners
  winners: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

  // Customizable settings for the event
  config: {
    // Placeholder for future configuration settings
  },

  // Streaming and betting configurations
  streamingUrl: String,
  streamingSchedule: { start: Date, end: Date },
  bettingOptions: [{
    type: String,
    description: String,
    odds: Number,
  }],

  // Engagement metrics and compliance settings
  viewCount: Number,
  feedback: [{ type: mongoose.Schema.Types.ObjectId, ref: "UserFeedback" }],
  socialSharingLinks: [String],
  ageRestriction: Number,
  geographicRestrictions: [String],
});

// Compiling the schema into a Model
const Event = mongoose.model("Event", eventSchema);

// Exporting the Event model for use in other parts of the application
module.exports = Event;
