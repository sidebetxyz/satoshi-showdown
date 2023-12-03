// userModel.js
/**
 * User Model for Satoshi Showdown
 *
 * Defines the schema for user profiles. Accommodates both registered and guest users, 
 * each identified by a unique identifier.
 */

const mongoose = require("mongoose");
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema({
  // Basic user information
  username: { type: String, required: true, unique: true },
  email: { type: String, unique: true, sparse: true },
  passwordHash: { type: String },
  registrationDate: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now },

  // Role differentiation
  role: {
    type: String,
    enum: ["participant", "organizer", "admin"],
    default: "participant",
  },

  // Comprehensive profile information
  profileInfo: {
    avatar: String,
    bio: String,
    twitch: String,
    youtube: String,
    twitter: String,
    instagram: String,
    personalWebsite: String,
    xboxLive: String,
    nintendoOnline: String,
    playStationNetwork: String,
    steam: String,
    battleNet: String,
  },

  // Universal unique identifier for all users
  uniqueIdentifier: { type: String, default: uuidv4, unique: true },

  // IP address tracking
  ipAddress: { type: String },

  // Organizational Affiliation
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    default: null,
  },

  // Event associations
  eventsCreated: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
  eventsParticipated: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],

  // Transaction association
  transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Transaction" }],
});

const User = mongoose.model("User", userSchema);
module.exports = User;
