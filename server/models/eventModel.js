const mongoose = require("mongoose");

/**
 * Event Model
 *
 * Represents and manages events within the Satoshi Showdown platform. This model
 * includes all necessary details for event organization, participant management,
 * and specific features like participant-specific streaming links.
 */
const eventSchema = new mongoose.Schema({
  // Basic event details
  name: { type: String, required: true },
  description: String,
  type: String,
  startDate: { type: Date, required: true },
  endDate: Date,
  status: {
    type: String,
    enum: ["planning", "active", "completed"],
    default: "planning",
  },
  entryFee: Number,
  prizePool: Number,

  // Event creator details
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  // Participant details along with their streaming links
  participants: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      streamingLink: String, // Link to participant's stream of the event
    },
  ],

  // Configurable settings for the event
  config: {
    maxParticipants: Number,
    // Other customizable settings
  },

  // Transactions related to the event
  transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Transaction" }],

  // Streaming and side betting
  streamingUrl: String,
  streamingSchedule: {
    start: Date,
    end: Date,
  },
  bettingOptions: [
    {
      type: String,
      description: String,
      odds: Number,
      // Other betting-related fields
    },
  ],

  // Engagement and analytics
  viewCount: Number,
  feedback: [{ type: mongoose.Schema.Types.ObjectId, ref: "UserFeedback" }],
  socialSharingLinks: [String],

  // Compliance and legal aspects
  ageRestriction: Number,
  geographicRestrictions: [String],
});

// Model creation
const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
