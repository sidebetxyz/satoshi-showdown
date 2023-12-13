/**
 * @fileoverview Event Service for Satoshi Showdown.
 * Provides functionalities for managing event-related operations such as creating,
 * updating, deleting, and retrieving events. Also manages financial transactions
 * and webhooks associated with events. This service acts as a bridge between the
 * event controllers and the database models, ensuring that business logic and data
 * manipulation are handled effectively.
 *
 * @module services/eventService
 * @requires models/eventModel - Event data model for database interactions.
 * @requires services/walletService - Service for wallet management, crucial for financial transactions.
 * @requires services/transactionService - Service for creating and managing transaction records.
 * @requires services/webhookService - Service for managing webhooks, important for event notifications.
 * @requires services/userService - Service for user management, used for verifying user details.
 * @requires utils/validationUtil - Utility for data validation, ensures the integrity of input data.
 * @requires utils/errorUtil - Custom error classes and error handling utilities for consistent error management.
 * @requires utils/logUtil - Logging utility for application-wide logging, critical for monitoring and debugging.
 */

const Event = require("../models/eventModel");
const {
  createSegWitWalletForEvent,
  addTransactionToWallet,
} = require("./walletService");
const { createTransactionRecord } = require("./transactionService");
const { createWebhook } = require("./webhookService");
const { getUserById } = require("./userService");
const { validateEvent } = require("../utils/validationUtil");
const { ValidationError, NotFoundError } = require("../utils/errorUtil");
const log = require("../utils/logUtil");

/**
 * Creates a new event with the provided details.
 * This function validates the event data, sets up financial transactions and webhooks,
 * and then saves the new event to the database. It is designed to handle all aspects
 * of event creation, ensuring a cohesive process.
 *
 * @async
 * @function createEvent
 * @param {string} userAddress - Bitcoin address of the user creating the event.
 * @param {string} userId - ID of the user creating the event.
 * @param {Object} eventData - Data for creating the new event.
 * @param {string} eventData.name - Name of the event.
 * @param {string} eventData.description - Detailed description of the event.
 * @param {string} eventData.type - Type or category of the event.
 * @param {Date} eventData.startTime - Scheduled start time of the event.
 * @param {Date} eventData.endTime - Scheduled end time of the event.
 * @param {string} eventData.status - Current status of the event.
 * @param {number} eventData.entryFee - Entry fee required to participate in the event.
 * @param {number} eventData.prizePool - Total prize pool available for the event winners.
 * @param {ObjectID} eventData.creator - Reference to the User model for the event creator.
 * @param {Array} eventData.participants - List of participants in the event.
 * @param {Array} eventData.transactions - Associated financial transactions.
 * @param {Array} eventData.winners - List of winners of the event.
 * @param {Object} eventData.config - Custom configuration options for the event.
 * @param {string} eventData.streamingUrl - URL for live streaming of the event.
 * @param {Object} eventData.streamingSchedule - Schedule for the streaming of the event.
 * @param {Array} eventData.bettingOptions - Betting options available for the event.
 * @param {number} eventData.viewCount - Number of views or attendance count for the event.
 * @param {Array} eventData.feedback - User feedback associated with the event.
 * @param {Array} eventData.socialSharingLinks - Links for social sharing of the event.
 * @param {number} eventData.ageRestriction - Age restriction for participation or viewing.
 * @param {Array} eventData.geographicRestrictions - Geographic restrictions for the event.
 * @return {Promise<Object>} The created event object with complete details.
 * @throws {ValidationError} When event data validation fails, indicating invalid or incomplete input.
 * @throws {NotFoundError} When the user specified by userId is not found in the database.
 */
const createEvent = async (userAddress, userId, eventData) => {
  try {
    const validation = validateEvent(eventData);
    if (validation.error) {
      throw new ValidationError(
        "Invalid event data: " + validation.error.details[0].message,
      );
    }

    const user = await getUserById(userId);
    if (!user) {
      throw new NotFoundError(`User with ID ${userId} not found`);
    }

    console.log("eventData: ", eventData);
    const financialSetup = await handleFinancialSetup(
      userAddress,
      user._id,
      eventData,
    );

    const newEvent = new Event({
      ...eventData,
      creator: user._id,
      transactions: [financialSetup.transaction._id],
    });

    await newEvent.save();
    log.info(`New event created: ${newEvent._id}`);
    return newEvent;
  } catch (err) {
    log.error(`Error in createEvent: ${err.message}`);
    throw err;
  }
};

/**
 * Updates an existing event based on the provided event ID and update data.
 * This function looks up the event by its ID and applies the provided updates.
 * It ensures that the event data is kept current and accurate.
 *
 * @async
 * @function updateEvent
 * @param {string} eventId - ID of the event to be updated.
 * @param {Object} updateData - Data containing the updates to be applied to the event.
 * @param {string} updateData.name - Updated name of the event.
 * @param {string} updateData.description - Updated detailed description of the event.
 * @param {string} updateData.type - Updated type or category of the event.
 * @param {Date} updateData.startTime - Updated scheduled start time of the event.
 * @param {Date} updateData.endTime - Updated scheduled end time of the event.
 * @param {string} updateData.status - Updated current status of the event.
 * @param {number} updateData.entryFee - Updated entry fee required to participate in the event.
 * @param {number} updateData.prizePool - Updated total prize pool available for the event winners.
 * @param {ObjectID} updateData.creator - Updated reference to the User model for the event creator.
 * @param {Array} updateData.participants - Updated list of participants in the event.
 * @param {Array} updateData.transactions - Updated associated financial transactions.
 * @param {Array} updateData.winners - Updated list of winners of the event.
 * @param {Object} updateData.config - Updated custom configuration options for the event.
 * @param {string} updateData.streamingUrl - Updated URL for live streaming of the event.
 * @param {Object} updateData.streamingSchedule - Updated schedule for the streaming of the event.
 * @param {Array} updateData.bettingOptions - Updated betting options available for the event.
 * @param {number} updateData.viewCount - Updated number of views or attendance count for the event.
 * @param {Array} updateData.feedback - Updated user feedback associated with the event.
 * @param {Array} updateData.socialSharingLinks - Updated links for social sharing of the event.
 * @param {number} updateData.ageRestriction - Updated age restriction for participation or viewing.
 * @param {Array} updateData.geographicRestrictions - Updated geographic restrictions for the event.
 * @return {Promise<Object>} The updated event object, reflecting the changes made.
 * @throws {NotFoundError} When no event with the provided ID is found in the database.
 */
const updateEvent = async (eventId, updateData) => {
  try {
    const event = await Event.findByIdAndUpdate(eventId, updateData, {
      new: true,
    });
    if (!event) {
      throw new NotFoundError(`Event with ID ${eventId} not found`);
    }
    log.info(`Event updated: ${event._id}`);
    return event;
  } catch (err) {
    log.error(`Error in updateEvent: ${err.message}`);
    throw err;
  }
};

/**
 * Retrieves a specific event by its unique ID.
 * This function is used to get detailed information about a single event,
 * including its data and related transactions or webhooks.
 *
 * @async
 * @function getEvent
 * @param {string} eventId - ID of the event to be retrieved.
 * @return {Promise<Object>} The event object corresponding to the specified ID.
 * @throws {NotFoundError} When the event with the given ID does not exist in the database.
 */
const getEvent = async (eventId) => {
  try {
    const event = await Event.findById(eventId);
    if (!event) {
      throw new NotFoundError(`Event with ID ${eventId} not found`);
    }
    return event;
  } catch (err) {
    log.error(`Error in getEvent: ${err.message}`);
    throw err;
  }
};

/**
 * Retrieves all events available in the system.
 * This function is typically used to list all events, for example, in an administrative
 * dashboard or a public event listing. It provides a complete overview of all events.
 *
 * @async
 * @function getAllEvents
 * @return {Promise<Array>} An array containing all event objects in the database.
 */
const getAllEvents = async () => {
  try {
    return await Event.find({});
  } catch (err) {
    log.error(`Error in getAllEvents: ${err.message}`);
    throw err;
  }
};

/**
 * Deletes an event from the system based on its ID.
 * This function removes the event and any associated data from the database,
 * effectively canceling the event and cleaning up resources.
 *
 * @async
 * @function deleteEvent
 * @param {string} eventId - ID of the event to be deleted.
 * @return {Promise<void>} Indicates successful deletion of the event.
 * @throws {NotFoundError} When the event with the specified ID is not found.
 */
const deleteEvent = async (eventId) => {
  try {
    const event = await Event.findByIdAndRemove(eventId);
    if (!event) {
      throw new NotFoundError(`Event with ID ${eventId} not found`);
    }
    log.info(`Event deleted: ${event._id}`);
  } catch (err) {
    log.error(`Error in deleteEvent: ${err.message}`);
    throw err;
  }
};

/**
 * Handles the financial setup for an event, including wallet and transaction creation.
 * This is a private function used internally by the createEvent function to encapsulate
 * the financial aspects of event setup, ensuring a smooth and error-free process.
 *
 * @async
 * @function handleFinancialSetup
 * @param {string} userAddress - Bitcoin address for the transaction.
 * @param {string} userRef - User reference ID.
 * @param {number} entryFee - Entry fee required to participate in the event.
 * @param {number} prizePoolContribution - Contribution to the prize pool, if any.
 * @return {Promise<Object>} An object containing details about the wallet and transaction created.
 * @private
 * @throws {Error} When financial setup encounters an error, such as wallet creation failure.
 */
const handleFinancialSetup = async (
  userAddress,
  userRef,
  entryFee,
  prizePoolContribution,
) => {
  try {
    // Calculate the total amount the user needs to send in
    const totalAmount = entryFee + prizePoolContribution;

    // Generate a unique random amount of satoshis
    const uniqueSatoshis = Math.floor(Math.random() * 1000); // Adjust the range as needed

    // Add the unique amount to the total
    const expectedAmount = totalAmount + uniqueSatoshis;

    // Create a SegWit wallet for the event
    const wallet = await createSegWitWalletForEvent();

    // Prepare transaction data for the financial setup
    const transactionData = {
      userRef: userRef,
      walletRef: wallet._id,
      transactionType: "incoming",
      expectedAmount: expectedAmount,
      walletAddress: wallet.publicAddress,
      userAddress: userAddress,
    };

    // Create a transaction record for the event
    const transaction = await createTransactionRecord(transactionData);

    // Add the transaction to the wallet
    await addTransactionToWallet(wallet._id, transaction._id);

    // Create a webhook for the wallet and transaction
    await createWebhook(wallet.publicAddress, transaction._id);

    log.info(
      `Financial setup completed for event: Wallet and transaction created`,
    );

    // Return an object containing wallet and transaction details
    return { wallet, transaction };
  } catch (err) {
    log.error(`Error in handleFinancialSetup: ${err.message}`);
    throw new Error(
      `Failed to set up financial aspects of the event: ${err.message}`,
    );
  }
};

module.exports = {
  createEvent,
  updateEvent,
  deleteEvent,
  getEvent,
  getAllEvents,
};
