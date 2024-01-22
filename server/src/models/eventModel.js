/**
 * @fileoverview Event Model for Satoshi Showdown.
 * Defines the structure and constraints for events within the Satoshi Showdown platform.
 * Encapsulates event information, schedule, participation details, financial aspects, and metadata.
 * Instrumental in representing and managing event data in the application's database.
 *
 * @module models/Event
 * @requires mongoose - Mongoose library for MongoDB object modeling.
 * @requires uuid - UUID library for generating unique identifiers.
 */

const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

/**
 * EventSchema: Defines structure and rules for event-related data.
 * Includes event name, type, schedule, participant information, and financial aspects.
 * Manages event lifecycle stages, open/closed status, and closure time.
 *
 * @typedef {Object} EventSchema
 * @property {string} eventId - Unique identifier.
 * @property {string} name - Event name.
 * @property {string} description - Event description.
 * @property {string} type - Event type.
 * @property {Date} startTime - Scheduled start time.
 * @property {Date} endTime - Scheduled end time.
 * @property {string} status - Event lifecycle status.
 * @property {number} entryFee - Participant entry fee.
 * @property {number} prizePool - Prize amount available.
 * @property {mongoose.Schema.Types.ObjectId} creator - Reference to the event creator.
 * @property {Array} participants - Array of participant references with join timestamps.
 * @property {number} maxParticipants - Maximum allowed participants.
 * @property {number} minParticipants - Minimum required participants.
 * @property {boolean} isOpen - Open status for new participants.
 * @property {Date} closedAt - Timestamp of event closure.
 * @property {Array} transactions - References to associated financial transactions.
 * @property {Array} winners - References to event winners.
 * @property {Object} config - Configuration details.
 * @property {string} streamingUrl - Live streaming URL.
 * @property {Object} streamingSchedule - Live streaming schedule.
 * @property {Array} bettingOptions - Betting options details.
 * @property {number} viewCount - Event view count.
 * @property {Array} feedback - User feedback references.
 * @property {Array} socialSharingLinks - Social sharing links.
 * @property {number} ageRestriction - Age restriction for participation.
 * @property {Array} geographicRestrictions - Geographic limitations.
 * @property {string} settlementType - Method used to determine the outcome of the event.
 * @property {Array} voteResults - Voting results from participants.
 * @property {boolean} isDisputed - Whether the event result is disputed.
 * @property {Array} disputeEvidence - Evidence submitted for disputed results.
 * @property {string} disputeResolutionStatus - Status of dispute resolution.
 * @property {string} settlementStatus - Status of event settlement.
 * @property {Object} finalOutcome - Final outcome details with winners and settlement time.
 */
const eventSchema = new mongoose.Schema(
  {
    eventId: { type: String, default: uuidv4, unique: true },
    name: { type: String, required: true },
    description: String,
    type: String,
    startTime: Date,
    endTime: Date,
    status: {
      type: String,
      enum: [
        "planning",
        "ready",
        "active",
        "settling",
        "completed",
        "cancelled",
      ],
      default: "planning",
    },
    entryFee: { type: Number, required: true, default: 0 },
    prizePool: { type: Number, required: true, default: 0 },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    participants: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    maxParticipants: { type: Number, required: true },
    minParticipants: { type: Number, required: true },
    isOpen: { type: Boolean, default: true },
    closedAt: Date,
    walletAddress: { type: String, required: true },
    walletRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wallet",
      required: true,
    },
    transactions: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Transaction" },
    ],
    winners: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    config: Object,
    streamingUrl: String,
    streamingSchedule: { start: Date, end: Date },
    bettingOptions: [
      {
        type: { type: String },
        description: String,
        odds: Number,
      },
    ],
    viewCount: { type: Number, default: 0 },
    feedback: [{ type: mongoose.Schema.Types.ObjectId, ref: "UserFeedback" }],
    socialSharingLinks: [String],
    ageRestriction: Number,
    geographicRestrictions: [String],
    settlementType: {
      type: String,
      enum: ["voting", "oracle", "referee", "automatic"],
      default: "voting",
      required: true,
    },
    voteResults: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        vote: { type: String, enum: ["win", "loss", "draw", "dispute"] },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    isDisputed: { type: Boolean, default: false },
    disputeEvidence: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        evidenceUrl: String,
        submittedAt: { type: Date, default: Date.now },
      },
    ],
    disputeResolutionStatus: {
      type: String,
      enum: ["pending", "resolved", "escalated"],
      default: "pending",
    },
    settlementStatus: {
      type: String,
      enum: ["unsettled", "processing", "settled", "contested"],
      default: "unsettled",
    },
    finalOutcome: {
      winners: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      settledAt: Date,
    },
  },
  { timestamps: true },
);

/**
 * Event model based on the defined schema.
 * Represents an event within the Satoshi Showdown platform, encapsulating all data and behaviors
 * related to event management. This includes event creation, modification, participant management,
 * and handling of associated financial transactions and user feedback.
 *
 * @typedef {mongoose.Model<module:models/Event~EventSchema>} EventModel
 */

const Event = mongoose.model("Event", eventSchema);
module.exports = Event;
