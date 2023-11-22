const mongoose = require("mongoose");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");

// Schema for creating and managing events.
const eventSchema = new mongoose.Schema({
  privateSerialNumber: {
    // A private identifier for internal use.
    type: String,
    required: true,
    unique: true,
    default: () => crypto.randomBytes(16).toString("hex"),
  },
  publicId: {
    // Public identifier for external reference (e.g., in URLs).
    type: String,
    required: true,
    unique: true,
    default: uuidv4,
  },
  name: { type: String, required: true }, // Name of the event.
  description: String, // Description of the event.
  type: { type: String, required: true }, // Type of event (e.g., tournament, meetup).
  entryFee: { type: Number, required: true }, // Entry fee for the event.
  maxParticipants: { type: Number, required: true }, // Maximum number of participants.
  startTime: { type: Date, default: Date.now }, // Start time of the event.
  endTime: Date, // End time of the event.
  status: {
    // Status of the event (awaiting deposit, active, etc.).
    type: String,
    enum: [
      "awaitingDeposit",
      "awaitingParticipants",
      "active",
      "finished",
      "settled",
      "cancelled",
    ],
    default: "awaitingDeposit",
  },
  participants: [
    // List of participants in the event.
    {
      wallet: { type: mongoose.Schema.Types.ObjectId, ref: "Wallet" },
      transaction: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction" },
    },
  ],
});

// Instance method to get the current number of participants.
eventSchema.methods.getParticipantCount = function () {
  return this.participants.length;
};

// Instance method to get the number of available slots.
eventSchema.methods.getAvailableSlots = function () {
  return this.maxParticipants - this.participants.length;
};

const Event = mongoose.model("Event", eventSchema);
module.exports = Event;
