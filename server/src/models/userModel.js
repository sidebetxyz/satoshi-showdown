/**
 * @fileoverview User Model for Satoshi Showdown.
 * This model defines the structure and constraints for user profiles within the platform.
 * It accommodates both registered and guest users, tracking a variety of user-specific information
 * such as credentials, roles, activity, and associations with other entities like events and transactions.
 * The model is crucial for managing user identities, authentication, authorization, and user-related
 * functionalities across the platform.
 *
 * @module models/User
 * @requires mongoose - Mongoose library for MongoDB object modeling, offering schema definition and data validation.
 * @requires uuid - UUID library for generating unique identifiers, utilized for creating distinct user IDs.
 */

const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

/**
 * Schema definition for the User model.
 * Specifies the structure, data types, and validation rules for fields associated with a user profile.
 * Fields include identifiers, credentials, activity timestamps, roles, and relationships to other entities
 * like events and transactions. This schema ensures proper data organization and integrity for user-related
 * operations in the platform.
 *
 * @typedef {Object} UserSchema
 * @property {string} userId - Unique identifier for the user.
 * @property {string} username - Username for the user, required and unique.
 * @property {string} email - Email address of the user, unique but not required for all users.
 * @property {string} passwordHash - Hashed password for security purposes.
 * @property {Date} lastActive - Timestamp of the user's last activity.
 * @property {string} role - Role of the user within the platform.
 * @property {Object} profileInfo - Additional profile information, structure can vary.
 * @property {string} ipAddress - IP address of the user, used for tracking or security purposes.
 * @property {mongoose.Schema.Types.ObjectId} organization - Reference to an Organization, if applicable.
 *
 * @type {mongoose.Schema}
 */
const userSchema = new mongoose.Schema(
  {
    userId: { type: String, default: uuidv4, unique: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, unique: true, sparse: true },
    passwordHash: { type: String, required: true },
    lastActive: { type: Date, default: Date.now },
    role: {
      type: String,
      enum: ["User", "Organizer", "Oracle", "Staff", "Admin", "SuperAdmin"],
      default: "User",
    },
    profileInfo: Object,
    ipAddress: String,
    organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization" },
  },
  { timestamps: true },
);

/**
 * User model based on the defined schema.
 * Represents a user's profile in the Satoshi Showdown platform, encompassing critical information
 * necessary for the user's interaction and participation within the system. This model serves as
 * a foundational element for user management, security, and engagement features of the platform.
 *
 * @typedef {mongoose.Model<module:models/User~UserSchema>} UserModel
 */

/**
 * @type {UserModel}
 */
const User = mongoose.model("User", userSchema);

module.exports = User;
