// eventModel.js
/**
 * Event Model
 *
 * Manages events within the Satoshi Showdown platform, encompassing details for
 * event organization, participant management, and streaming/betting features.
 */

const mongoose = require("mongoose");

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

  // Event creator and participants
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  participants: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      streamingLink: String,
    },
  ],

  // Event configuration settings
  config: {
    maxParticipants: Number,
    // Additional customizable settings
  },

  // Related transactions
  transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Transaction" }],

  // Streaming and betting options
  streamingUrl: String,
  streamingSchedule: { start: Date, end: Date },
  bettingOptions: [
    {
      type: String,
      description: String,
      odds: Number,
    },
  ],

  // Engagement, feedback, and compliance
  viewCount: Number,
  feedback: [{ type: mongoose.Schema.Types.ObjectId, ref: "UserFeedback" }],
  socialSharingLinks: [String],
  ageRestriction: Number,
  geographicRestrictions: [String],
});

const Event = mongoose.model("Event", eventSchema);
module.exports = Event;
