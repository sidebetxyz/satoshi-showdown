/**
 * @fileoverview Validation Utility for Satoshi Showdown.
 * Provides a suite of validation functions for various data types and formats.
 * Leverages the Joi library for comprehensive and flexible validation schemes,
 * ensuring data integrity and conformity to application standards.
 */

const Joi = require("joi");

// Common Validators
const validateEmail = Joi.string().email().label("Email");
const validateString = Joi.string().trim().min(1).label("String");
const validateNumber = Joi.number().label("Number");
const validateDate = Joi.date().iso().label("Date");

// Domain-Specific Validators
const validateCryptoAddress = Joi.string().label("Crypto Address");
const validatePassword = Joi.string().min(8).label("Password");
const validateObjectId = Joi.string()
  .regex(/^[0-9a-fA-F]{24}$/)
  .label("ObjectID");

/**
 * Validates user data against a defined schema.
 * @param {Object} data - User data to validate.
 * @return {Joi.ValidationResult} Result of the validation.
 */
const validateUser = (data) =>
  Joi.object({
    username: validateString.required(),
    email: validateEmail.optional(), // Email is optional for guest users
    password: validatePassword.when("isGuest", {
      is: false,
      then: Joi.required(),
    }), // Password is required for non-guest users
    role: Joi.string()
      .valid("participant", "organizer", "admin")
      .default("participant"),
    ipAddress: validateString.optional(),
    isGuest: Joi.boolean().optional(),
    // Add other fields from your user model if necessary
  }).validate(data, { abortEarly: false });

/**
 * Validates event data against a defined schema.
 * @param {Object} data - Event data to validate.
 * @return {Joi.ValidationResult} Result of the validation.
 */
const validateEvent = (data) =>
  Joi.object({
    name: validateString.required(),
    description: validateString.optional(),
    type: validateString.optional(),
    startTime: validateDate.required(),
    endTime: validateDate.optional(),
    status: Joi.string()
      .valid("planning", "active", "completed")
      .default("planning"),
    entryFee: validateNumber.required(),
    prizePool: validateNumber.optional(),
    maxParticipants: validateNumber.optional(),
    streamingUrl: validateString.optional(),
    streamingSchedule: Joi.object({
      start: validateDate.optional(),
      end: validateDate.optional(),
    }).optional(),
    bettingOptions: Joi.array()
      .items(
        Joi.object({
          type: validateString,
          description: validateString,
          odds: validateNumber,
        }),
      )
      .optional(),
    viewCount: validateNumber.optional(),
    feedback: Joi.array().items(validateObjectId).optional(),
    socialSharingLinks: Joi.array().items(validateString).optional(),
    ageRestriction: validateNumber.optional(),
    geographicRestrictions: Joi.array().items(validateString).optional(),
  }).validate(data, { abortEarly: false });

// ... Similar validators for Transaction, Wallet, Webhook

module.exports = {
  validateEmail,
  validateString,
  validateNumber,
  validateDate,
  validateCryptoAddress,
  validatePassword,
  validateObjectId,
  validateUser,
  validateEvent,
  // ... Export other validators
};
