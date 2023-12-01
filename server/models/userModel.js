const mongoose = require("mongoose");

/**
 * User Model
 *
 * Defines the schema for user profiles on the Satoshi Showdown platform.
 * It accommodates both registered and guest users, integrating personal, social,
 * and gaming profiles for a comprehensive user experience.
 */
const userSchema = new mongoose.Schema({
  // Basic user information
  username: { type: String, required: true, unique: true },
  email: { type: String, unique: true, sparse: true }, // Sparse index for optional unique field
  passwordHash: { type: String }, // Only for registered users
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
    nintendoOnline: String, // Nintendo's Online Service
    playStationNetwork: String, // PlayStation Network
    steam: String, // Steam
    battleNet: String, // Blizzard's Battle.net
    // Additional social and gaming profiles as needed
  },

  // IP address tracking (especially for guest users)
  ipAddress: { type: String },

  // Organizational Affiliation (if applicable)
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

// Model creation
const User = mongoose.model("User", userSchema);

module.exports = User;
