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
const emailValidator = Joi.string().email();
const stringValidator = Joi.string().trim().min(1);

// Domain-Specific Validators
const cryptoAddressValidator = Joi.string(); // Add specific regex or rules as needed
const passwordValidator = Joi.string().min(8); // Adjust rules for password strength

// Composite validators for complex objects (e.g., user, event)
const userValidator = Joi.object({
  username: stringValidator.required(),
  email: emailValidator.required(),
  password: passwordValidator.required(),
  // Add more fields as per the User model
});

const eventValidator = Joi.object({
  name: stringValidator.required(),
  startDate: Joi.date().required(),
  // Add more fields as per the Event model
});

// Export validators for use across the application
module.exports = {
  emailValidator,
  stringValidator,
  cryptoAddressValidator,
  passwordValidator,
  userValidator,
  eventValidator,
  // Export other validators as they are implemented
};
