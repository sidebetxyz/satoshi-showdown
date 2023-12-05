/**
 * @fileoverview Service for managing event-related operations in Satoshi Showdown.
 * Provides functionalities for creating, updating, deleting, and retrieving events,
 * as well as setting up financial transactions and managing webhooks associated with these events.
 */

const Event = require('../models/eventModel');
const { createUser, getUserById } = require('./userService');
const { createWalletForEvent } = require('./walletService');
const { createTransaction } = require('./transactionService');
const { createWebhook } = require('./webhookService');
const { validateEvent } = require('../utils/validationUtil');
const { ValidationError, NotFoundError } = require('../utils/errorUtil');
const log = require('../utils/logUtil');

/**
 * Creates a new event. If a guest username is provided, a guest user is created.
 * Validates event data before creation and sets up associated financial transactions and webhooks.
 * 
 * @param {Object} eventData - Data for creating the new event.
 * @param {string} userId - ID of the user creating the event, if available.
 * @param {string} [guestUsername] - Optional username for a guest user.
 * @returns {Promise<Object>} A promise that resolves to the created event object.
 * @throws {ValidationError} Thrown when event data validation fails.
 * @throws {NotFoundError} Thrown when a user is not found.
 */
const createEvent = async (eventData, userId, guestUsername) => {
    try {
        const validation = validateEvent(eventData);
        if (validation.error) {
            throw new ValidationError('Invalid event data: ' + validation.error.details[0].message);
        }

        let user;
        if (userId) {
            user = await getUserById(userId);
            if (!user) {
                throw new NotFoundError(`User with ID ${userId} not found`);
            }
        } else if (guestUsername) {
            user = await createUser({ username: guestUsername, isGuest: true });
        }

        if (!user) {
            throw new NotFoundError('User not found or creation failed');
        }

        // Handle the financial setup before saving the event
        const financialSetup = await handleFinancialSetup(eventData, user._id);

        const newEvent = new Event({
            ...eventData,
            creator: user._id,
            wallet: financialSetup.wallet._id,
            transactions: [financialSetup.transaction._id]
        });

        await newEvent.save();
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
 */
const updateEvent = async (eventId, updateData) => {
    const event = await Event.findById(eventId);
    if (!event) {
        throw new NotFoundError(`Event with ID ${eventId} not found`);
    }

    Object.assign(event, updateData);
    await event.save();
    return event;
};

/**
 * Retrieves a specific event by ID.
 * 
 * @param {string} eventId - The ID of the event to retrieve.
 * @returns {Promise<Object>} The retrieved event object.
 */
const getEvent = async (eventId) => {
    const event = await Event.findById(eventId);
    if (!event) {
        throw new NotFoundError(`Event with ID ${eventId} not found`);
    }

    return event;
};

/**
 * Retrieves all events.
 * 
 * @returns {Promise<Array>} An array of all events.
 */
const getAllEvents = async () => {
    return await Event.find({});
};

/**
 * Deletes an existing event.
 * 
 * @param {string} eventId - The ID of the event to delete.
 * @returns {Promise<void>}
 */
const deleteEvent = async (eventId) => {
    const event = await Event.findById(eventId);
    if (!event) {
        throw new NotFoundError(`Event with ID ${eventId} not found`);
    }

    await event.remove();
};

/**
 * Handles the financial setup for an event, including wallet creation, 
 * transaction record, and webhook setup. This function is private to the 
 * eventService module.
 * 
 * @param {Object} eventData - Data for the event.
 * @param {string} userId - ID of the user creating the event.
 * @returns {Promise<Object>} An object containing the created wallet and transaction.
 * @private
 * @throws {Error} Thrown when any part of the financial setup fails.
 */
const handleFinancialSetup = async (eventData, userId) => {
    try {
        const wallet = await createWalletForEvent(userId);
        log.info(`Created wallet with address: ${wallet.publicAddress}`);

        const transaction = await createTransaction({
            eventId: eventData._id,
            userId,
            expectedAmount: eventData.entryFee,
            address: wallet.publicAddress
        });
        log.info(`Created transaction with ID: ${transaction._id}`);

        const webhook = await createWebhook(transaction.address, transaction._id, eventData.requiredConfirmations);
        log.info(`Created webhook with ID: ${webhook.uniqueId}`);
    } catch (err) {
        log.error(`Error in handleFinancialSetup: ${err.message}`);
        throw new Error(`Failed to set up financial aspects of the event: ${err.message}`);
    }

    return { wallet, transaction };
};

module.exports = {
    createEvent,
    updateEvent,
    deleteEvent,
    getEvent,
    getAllEvents
};
