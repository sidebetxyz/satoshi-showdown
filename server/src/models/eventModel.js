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
 * Specifies the structure, data types, and validation rules for fields associated with an event.
 * Fields cover a range of properties including event identifiers, descriptive information, timing,
 * financial details, participant data, and additional configuration and metadata.
 *
 * @typedef {Object} EventSchema
 * @property {string} eventId - Unique identifier for the event.
 * @property {string} name - Name of the event, required for identification.
 * @property {string} description - Detailed description of the event.
 * @property {string} type - Type or category of the event.
 * @property {Date} startTime - Scheduled start time of the event.
 * @property {Date} endTime - Scheduled end time of the event.
 * @property {string} status - Current status of the event.
 * @property {number} entryFee - Entry fee required to participate in the event.
 * @property {number} prizePool - Total prize pool available for the event winners.
 * @property {mongoose.Schema.Types.ObjectId} creator - Reference to the User model for the event creator.
 * @property {mongoose.Schema.Types.ObjectId[]} participants - List of participants in the event.
 * @property {mongoose.Schema.Types.ObjectId[]} transactions - Associated financial transactions.
 * @property {mongoose.Schema.Types.ObjectId[]} winners - List of winners of the event.
 * @property {Object} config - Custom configuration options for the event.
 * @property {string} streamingUrl - URL for live streaming of the event.
 * @property {Object} streamingSchedule - Schedule for the streaming of the event.
 * @property {Object[]} bettingOptions - Betting options available for the event.
 * @property {number} viewCount - Number of views or attendance count for the event.
 * @property {mongoose.Schema.Types.ObjectId[]} feedback - User feedback associated with the event.
 * @property {string[]} socialSharingLinks - Links for social sharing of the event.
 * @property {number} ageRestriction - Age restriction for participation or viewing.
 * @property {string[]} geographicRestrictions - Geographic restrictions for the event.
 *
 * @type {mongoose.Schema}
 */
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
    bettingOptions: [
      {
        type: String,
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

/**
 * Event model based on the defined schema.
 * Represents an event in the Satoshi Showdown platform, encapsulating all data and behavior related to events.
 *
 * @typedef {mongoose.Model<module:models/Event~EventSchema>} EventModel
 */

/**
 * @type {EventModel}
 */
const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
