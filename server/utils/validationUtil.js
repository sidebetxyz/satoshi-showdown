// ValidationUtil.js
/**
 * Validation Utility for Satoshi Showdown
 *
 * Provides a suite of validation functions for various data types and formats.
 * Leverages the Joi library for comprehensive and flexible validation schemes,
 * ensuring data integrity and conformity to application standards.
 */

const Joi = require("joi");

// Common Validators
const emailValidator = Joi.string().email().label('Email');
const stringValidator = Joi.string().trim().min(1).label('String');
const numberValidator = Joi.number().label('Number');
const dateValidator = Joi.date().iso().label('Date');

// Domain-Specific Validators
const cryptoAddressValidator = Joi.string().label('Crypto Address');
const passwordValidator = Joi.string().min(8).label('Password');
const objectIdValidator = Joi.string().regex(/^[0-9a-fA-F]{24}$/).label('ObjectID');

// Composite validators for User Model
const userValidator = Joi.object({
  username: stringValidator.required(),
  email: emailValidator,
  password: passwordValidator,
  role: Joi.string().valid('participant', 'organizer', 'admin').label('Role'),
  uniqueIdentifier: Joi.string().label('Unique Identifier'),
  ipAddress: stringValidator,
  // Additional fields for user profile, etc.
}).label('User');

// Composite validators for Event Model
const eventValidator = Joi.object({
  name: stringValidator.required(),
  description: stringValidator,
  type: stringValidator,
  startTime: dateValidator.required(),
  endTime: dateValidator,
  status: Joi.string().valid('planning', 'active', 'completed'),
  entryFee: numberValidator,
  prizePool: numberValidator,
  maxParticipants: numberValidator, // Add this line
  // Include other fields from your JSON object as needed
  streamingUrl: stringValidator,
  streamingSchedule: Joi.object({
    start: dateValidator,
    end: dateValidator
  }),
  bettingOptions: Joi.array().items(Joi.object({
    type: stringValidator,
    description: stringValidator,
    odds: numberValidator
  })),
  viewCount: numberValidator,
  feedback: Joi.array().items(objectIdValidator), // Assuming feedback refers to user IDs
  socialSharingLinks: Joi.array().items(stringValidator),
  ageRestriction: numberValidator,
  geographicRestrictions: Joi.array().items(stringValidator)
}).label('Event');


// Composite validators for Transaction Model
const transactionValidator = Joi.object({
  transactionId: stringValidator.required(),
  userId: objectIdValidator.required(),
  expectedAmount: numberValidator.required(),
  receivedAmount: numberValidator,
  address: cryptoAddressValidator.required(),
  status: Joi.string().valid('pending', 'completed', 'failed').label('Status'),
  confirmations: numberValidator,
  confidenceFactor: numberValidator,
  // Additional fields...
}).label('Transaction');

// Composite validators for Wallet Model
const walletValidator = Joi.object({
  publicAddress: cryptoAddressValidator.required(),
  currencyType: Joi.string().valid('Bitcoin', 'Ethereum', 'Others').required().label('Currency Type'),
  balance: numberValidator,
  user: objectIdValidator,
  transactions: Joi.array().items(objectIdValidator),
  // Additional fields...
}).label('Wallet');

// Composite validators for Webhook Model
const webhookValidator = Joi.object({
  url: stringValidator.required(),
  method: Joi.string().valid('GET', 'POST', 'PUT', 'DELETE').label('Method'),
  event: objectIdValidator.required(),
  transaction: objectIdValidator.required(),
  status: Joi.string().valid('pending', 'success', 'failed').label('Status'),
  // Additional fields...
}).label('Webhook');

// Export validators for use across the application
module.exports = {
  emailValidator,
  stringValidator,
  numberValidator,
  dateValidator,
  cryptoAddressValidator,
  passwordValidator,
  objectIdValidator,
  userValidator,
  eventValidator,
  transactionValidator,
  walletValidator,
  webhookValidator,
  // Export other validators as they are implemented
};
