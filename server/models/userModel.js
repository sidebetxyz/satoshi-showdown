/**
 * @fileoverview User Model for Satoshi Showdown.
 * Represents user profiles, accommodating both registered and guest users.
 */

const mongoose = require("mongoose");
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, unique: true, sparse: true },
  passwordHash: String,
  registrationDate: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now },
  role: {
    type: String,
    enum: ["participant", "organizer", "admin"],
    default: "participant",
  },
  profileInfo: Object, // Placeholder for future profile fields
  uniqueIdentifier: { type: String, default: uuidv4, unique: true },
  ipAddress: String,
  organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization" },
  eventsCreated: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
  eventsParticipated: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
  transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Transaction" }],
});

const User = mongoose.model("User", userSchema);
module.exports = User;
