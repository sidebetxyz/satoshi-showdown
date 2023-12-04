/**
 * @fileoverview Event Model for Satoshi Showdown.
 * Defines the structure and constraints for events within the platform.
 */

const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  type: String,
  startTime: { type: Date, required: true },
  endTime: Date,
  status: {
    type: String,
    enum: ["planning", "active", "completed"],
    default: "planning",
  },
  entryFee: { type: Number, required: true },
  prizePool: Number,
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  participants: [{ user: mongoose.Schema.Types.ObjectId, ref: "User" }],
  transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Transaction" }],
  winners: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  config: Object, // Placeholder for future configuration settings
  streamingUrl: String,
  streamingSchedule: { start: Date, end: Date },
  bettingOptions: [{ type: String, description: String, odds: Number }],
  viewCount: Number,
  feedback: [{ type: mongoose.Schema.Types.ObjectId, ref: "UserFeedback" }],
  socialSharingLinks: [String],
  ageRestriction: Number,
  geographicRestrictions: [String],
});

const Event = mongoose.model("Event", eventSchema);
module.exports = Event;
