/**
 * @fileoverview Event Model for Satoshi Showdown.
 * Defines the structure and constraints for events within the platform.
 */

const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const eventSchema = new mongoose.Schema(
  {
    eventId: { type: String, default: uuidv4, unique: true },
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
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    transactions: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Transaction" },
    ],
    winners: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    config: Object,
    streamingUrl: String,
    streamingSchedule: { start: Date, end: Date },
    bettingOptions: [{ type: String, description: String, odds: Number }],
    viewCount: Number,
    feedback: [{ type: mongoose.Schema.Types.ObjectId, ref: "UserFeedback" }],
    socialSharingLinks: [String],
    ageRestriction: Number,
    geographicRestrictions: [String],
  },
  { timestamps: true },
);

const Event = mongoose.model("Event", eventSchema);
module.exports = Event;
