/**
 * @fileoverview Service for managing event-related operations in Satoshi Showdown.
 * Provides functionalities for creating, updating, deleting, and retrieving events,
 * as well as setting up financial transactions and managing webhooks associated with these events.
 */

const Event = require('../models/eventModel');
const { createSegWitWalletForEvent } = require('./walletService');
const { createTransactionRecord } = require('./transactionService');
const { createWebhook } = require('./webhookService');
const { getUserById } = require('./userService');
const { validateEvent } = require('../utils/validationUtil');
const { ValidationError, NotFoundError } = require('../utils/errorUtil');
const log = require('../utils/logUtil');

/**
 * Creates a new event.
 * Validates event data before creation and sets up associated financial transactions and webhooks.
 * 
 * @param {Object} eventData - Data for creating the new event.
 * @param {string} userId - ID of the user creating the event.
 * @param {string} userAddress - Bitcoin address of the user creating the event.
 * @returns {Promise<Object>} A promise that resolves to the created event object.
 * @throws {ValidationError} Thrown when event data validation fails.
 * @throws {NotFoundError} Thrown when a user is not found.
 */
const createEvent = async (eventData, userId, userAddress) => {
    try {
        const validation = validateEvent(eventData);
        if (validation.error) {
            throw new ValidationError('Invalid event data: ' + validation.error.details[0].message);
        }

        const user = await getUserById(userId);
        if (!user) {
            throw new NotFoundError(`User with ID ${userId} not found`);
        }

        const financialSetup = await handleFinancialSetup(eventData, user._id, userAddress);

        const newEvent = new Event({
            ...eventData,
            creator: user._id,
            wallet: financialSetup.wallet._id,
            transactions: [financialSetup.transaction._id]
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
 * Updates an existing event.
 * 
 * @param {string} eventId - The ID of the event to update.
 * @param {Object} updateData - Data for updating the event.
 * @returns {Promise<Object>} The updated event object.
 * @throws {NotFoundError} Thrown if the event is not found.
 */
const updateEvent = async (eventId, updateData) => {
    try {
        const event = await Event.findByIdAndUpdate(eventId, updateData, { new: true });
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
 * Retrieves a specific event by ID.
 * 
 * @param {string} eventId - The ID of the event to retrieve.
 * @returns {Promise<Object>} The retrieved event object.
 * @throws {NotFoundError} Thrown if the event is not found.
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
 * Retrieves all events.
 * 
 * @returns {Promise<Array>} An array of all events.
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
 * Deletes an existing event.
 * 
 * @param {string} eventId - The ID of the event to delete.
 * @returns {Promise<void>}
 * @throws {NotFoundError} Thrown if the event is not found.
 */
const deleteEvent = async (eventId) => {
    try {
        const event = await Event.findById(eventId);
        if (!event) {
            throw new NotFoundError(`Event with ID ${eventId} not found`);
        }
        await event.remove();
        log.info(`Event deleted: ${event._id}`);
    } catch (err) {
        log.error(`Error in deleteEvent: ${err.message}`);
        throw err;
    }
};

/**
 * Handles the financial setup for an event, including wallet creation, 
 * transaction record, and webhook setup. This function is private to the 
 * eventService module.
 * 
 * @param {Object} eventData - Data for the event.
 * @param {string} userRef - Reference ID of the user creating the event.
 * @param {string} userAddress - Bitcoin address of the user for the transaction.
 * @returns {Promise<Object>} An object containing the created wallet and transaction.
 * @private
 * @throws {Error} Thrown when any part of the financial setup fails.
 */
const handleFinancialSetup = async (eventData, userRef, userAddress) => {
    try {
        const wallet = await createSegWitWalletForEvent();

        const transactionData = {
            userId: userRef,
            walletId: wallet._id,
            transactionType: 'incoming',
            amount: eventData.entryFee,
            walletAddress: wallet.publicAddress,
            userAddress: userAddress
        };

        const transaction = await createTransactionRecord(transactionData);

        const webhook = await createWebhook(wallet.publicAddress, transaction._id);

        log.info(`Financial setup completed for event: Wallet and transaction created`);
        return { wallet, transaction };
    } catch (err) {
        log.error(`Error in handleFinancialSetup: ${err.message}`);
        throw new Error(`Failed to set up financial aspects of the event: ${err.message}`);
    }
};

module.exports = {
    createEvent,
    updateEvent,
    deleteEvent,
    getEvent,
    getAllEvents
};
