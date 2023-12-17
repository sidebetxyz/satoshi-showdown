/**
 * @fileoverview Event Model for Satoshi Showdown.
 * This model defines the structure and constraints for events within the Satoshi Showdown platform.
 * It encapsulates various aspects of an event, including its basic information, schedule, participation
 * details, financial aspects, and associated metadata like transactions, feedback, and restrictions.
 * The model is instrumental in representing and managing event-related data in the application's database.
 *
 * @module models/Event
 * @requires mongoose - Mongoose library for MongoDB object modeling, providing schema definition and data validation.
 * @requires uuid - UUID library for generating unique identifiers, used for creating distinct event IDs.
 */

const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

/**
 * Schema definition for the Event model.
 * The schema defines the structure and rules for event-related data,
 * including details like event name, type, schedule, participant information,
 * and financial aspects. Enhanced to manage minimum and maximum participants,
 * track participant join times, and handle event lifecycle stages including
 * planning, ready, active, and completed states. Additionally, tracks event
 * open/closed status and closure time.
 *
 * @typedef {Object} EventSchema
 * @property {string} eventId - Unique identifier, automatically generated.
 * @property {string} name - Name of the event, a brief title.
 * @property {string} description - Longer description detailing the event.
 * @property {string} type - Category or type of the event.
 * @property {Date} startTime - When the event is scheduled to start.
 * @property {Date} endTime - When the event is scheduled to end.
 * @property {string} status - Lifecycle status of the event (e.g., planning, ready, active, completed).
 * @property {number} entryFee - Cost for participants to enter the event.
 * @property {number} prizePool - Total prize amount available for winners.
 * @property {mongoose.Schema.Types.ObjectId} creator - Reference to the user who created the event.
 * @property {Array} participants - Array of participants with timestamps for when they joined.
 * @property {number} maxParticipants - Maximum allowed participants for the event.
 * @property {number} minParticipants - Minimum required participants to start the event.
 * @property {boolean} isOpen - Indicates if the event is open for new participants.
 * @property {Date} closedAt - Timestamp when the event stopped accepting participants.
 * @property {mongoose.Schema.Types.ObjectId[]} transactions - Financial transactions associated with the event.
 * @property {mongoose.Schema.Types.ObjectId[]} winners - Winners of the event, if applicable.
 * @property {Object} config - Miscellaneous configuration details for the event.
 * @property {string} streamingUrl - URL for any live streaming of the event.
 * @property {Object} streamingSchedule - Schedule for live streaming, if applicable.
 * @property {Object[]} bettingOptions - Details of betting options available for the event.
 * @property {number} viewCount - Counter for how many have viewed or attended the event.
 * @property {mongoose.Schema.Types.ObjectId[]} feedback - User feedback submitted for the event.
 * @property {string[]} socialSharingLinks - Links for sharing the event on social platforms.
 * @property {number} ageRestriction - Minimum age required to participate or attend.
 * @property {string[]} geographicRestrictions - Geographic limitations for the event.
 * @property {Date} createdAt - Timestamp of when the event was created.
 * @property {Date} updatedAt - Timestamp of the last update to the event.
 *
 * @type {mongoose.Schema}
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
      enum: ["planning", "ready", "active", "completed", "cancelled"],
      default: "planning",
    },
    entryFee: {
      type: Number,
      required: true,
      default: 0,
    },
    prizePool: {
      type: Number,
      required: true,
      default: 0,
    },
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
