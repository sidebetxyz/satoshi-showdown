// userModel.js
/**
 * User Model
 *
 * Defines the schema for user profiles on the Satoshi Showdown platform.
 * It accommodates both registered and guest users, integrating personal, social,
 * and gaming profiles for a comprehensive user experience.
 */

const mongoose = require("mongoose");

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
