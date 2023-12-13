/**
 * @fileoverview Validation Utility for Satoshi Showdown.
 * Provides a comprehensive suite of validation functions for various data types and formats
 * within the application, leveraging the Joi library. This ensures data integrity and
 * conformity to application standards, particularly for user and event data.
 *
 * @module utils/validationUtil
 * @requires joi - Joi library for data validation.
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
 * Validates user data against the defined schema.
 * The password is validated as a plain text string before hashing, ensuring it meets the defined criteria
 * (like minimum length). After validation, the password should be hashed before storing it in the database.
 *
 * @function validateUser
 * @param {Object} data - The user data to validate.
 * @return {Joi.ValidationResult} The result of the validation.
 */
const validateUser = (data) =>
  Joi.object({
    username: validateString.required(),
    email: validateEmail.optional(),
    password: validatePassword.required(), // Validate plain text password
    lastActive: validateDate.optional(),
    role: Joi.string()
      .valid("participant", "organizer", "admin")
      .default("participant"),
    profileInfo: Joi.object().optional(),
    ipAddress: validateString.optional(),
    organization: validateObjectId.optional(),
    eventsCreated: Joi.array().items(validateObjectId).optional(),
    eventsParticipated: Joi.array().items(validateObjectId).optional(),
    transactions: Joi.array().items(validateObjectId).optional(),
  }).validate(data, { abortEarly: false });

/**
 * Validates event data against the defined schema.
 * Ensures that the provided event data conforms to the structure and rules set in the Event model.
 * Includes validation for new fields like maxParticipants, minParticipants, isOpen, and closedAt.
 * This validation is crucial for maintaining data integrity and consistency in the application.
 *
 * @function validateEvent
 * @param {Object} data - The event data to validate.
 * @return {Joi.ValidationResult} The result of the validation.
 */
const validateEvent = (data) =>
  Joi.object({
    eventId: validateString.optional(),
    name: validateString.required(),
    description: validateString.optional(),
    type: validateString.optional(),
    startTime: validateDate.optional(),
    endTime: validateDate.optional(),
    status: Joi.string()
      .valid("planning", "ready", "active", "completed", "cancelled")
      .default("planning"),
    entryFee: validateNumber.optional(),
    prizePool: validateNumber.optional(),
    creator: validateObjectId.required(),
    participants: Joi.array()
      .items(
        Joi.object({
          userId: validateObjectId.required(),
          joinedAt: validateDate.optional(),
        }),
      )
      .optional(),
    maxParticipants: validateNumber.required(),
    minParticipants: validateNumber.required(),
    isOpen: Joi.boolean().optional(),
    closedAt: validateDate.optional(),
    transactions: Joi.array().items(validateObjectId).optional(),
    winners: Joi.array().items(validateObjectId).optional(),
    config: Joi.object().optional(),
    streamingUrl: validateString.optional(),
    streamingSchedule: Joi.object({
      start: validateDate.optional(),
      end: validateDate.optional(),
    }).optional(),
    bettingOptions: Joi.array()
      .items(
        Joi.object({
          type: validateString.required(),
          description: validateString.optional(),
          odds: validateNumber.optional(),
        }),
      )
      .optional(),
    viewCount: validateNumber.optional(),
    feedback: Joi.array().items(validateObjectId).optional(),
    socialSharingLinks: Joi.array().items(validateString).optional(),
    ageRestriction: validateNumber.optional(),
    geographicRestrictions: Joi.array().items(validateString).optional(),
  }).validate(data, { abortEarly: false });

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
};
