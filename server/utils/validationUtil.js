/**
 * @fileoverview Validation Utility for Satoshi Showdown.
 * Provides a suite of validation functions for various data types and formats.
 * Leverages the Joi library for comprehensive and flexible validation schemes,
 * ensuring data integrity and conformity to application standards.
 */

const Joi = require("joi");

// Common Validators
const validateEmail = Joi.string().email().label('Email');
const validateString = Joi.string().trim().min(1).label('String');
const validateNumber = Joi.number().label('Number');
const validateDate = Joi.date().iso().label('Date');

// Domain-Specific Validators
const validateCryptoAddress = Joi.string().label('Crypto Address');
const validatePassword = Joi.string().min(8).label('Password');
const validateObjectId = Joi.string().regex(/^[0-9a-fA-F]{24}$/).label('ObjectID');

/**
 * Validates user data against a defined schema.
 * @param {Object} data - User data to validate.
 * @returns {Joi.ValidationResult} Result of the validation.
 */
const validateUser = (data) => Joi.object({
  username: validateString.required(),
  email: validateEmail,
  password: validatePassword,
  role: Joi.string().valid('participant', 'organizer', 'admin').label('Role'),
  uniqueIdentifier: validateString,
  ipAddress: validateString,
  // Additional fields for user profile, etc.
}).validate(data, { abortEarly: false });

/**
 * Validates event data against a defined schema.
 * @param {Object} data - Event data to validate.
 * @returns {Joi.ValidationResult} Result of the validation.
 */
const validateEvent = (data) => Joi.object({
  name: validateString.required(),
  description: validateString,
  type: validateString,
  startTime: validateDate.required(),
  endTime: validateDate,
  status: Joi.string().valid('planning', 'active', 'completed'),
  entryFee: validateNumber,
  prizePool: validateNumber,
  maxParticipants: validateNumber,
  // Include other fields from your JSON object as needed
  streamingUrl: validateString,
  streamingSchedule: Joi.object({
    start: validateDate,
    end: validateDate
  }),
  bettingOptions: Joi.array().items(Joi.object({
    type: validateString,
    description: validateString,
    odds: validateNumber
  })),
  viewCount: validateNumber,
  feedback: Joi.array().items(validateObjectId),
  socialSharingLinks: Joi.array().items(validateString),
  ageRestriction: validateNumber,
  geographicRestrictions: Joi.array().items(validateString)
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
