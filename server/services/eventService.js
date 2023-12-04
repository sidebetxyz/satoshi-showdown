/**
 * @fileoverview Service for managing event-related operations in Satoshi Showdown.
 * Provides functionalities for creating, updating, deleting, and retrieving events,
 * as well as setting up financial transactions and managing webhooks associated with these events.
 */

const Event = require('../models/eventModel');
const { createWalletForEvent } = require('./walletService');
const { createTransaction } = require('./transactionService');
const { createWebhook } = require('./webhookService');
const { ValidationError, NotFoundError } = require('../utils/errorUtil');
const { validateEvent } = require('../utils/validationUtil');

/**
 * Creates a new event and manages associated financial transactions and webhooks.
 * 
 * @param {Object} eventData - Data for creating a new event.
 * @param {string} userId - ID of the user creating the event.
 * @returns {Promise<Object>} The created event object.
 */
const createEvent = async (eventData, userId) => {
    const { error } = validateEvent(eventData);
    if (error) {
        throw new ValidationError('Invalid event data: ' + error.details[0].message);
    }

    // Handle financial setup first
    const { wallet, transaction } = await handleFinancialSetup(eventData, userId);

    // Create the event with references to the wallet and transaction
    const newEvent = new Event({ ...eventData, creator: userId, wallet: wallet._id, transaction: transaction._id });
    await newEvent.save();

    return newEvent;
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
 * Handles the financial setup for an event, including wallet creation, transaction record,
 * and webhook setup. This function is private to the eventService module.
 * 
 * @param {Object} eventData - Data for the event.
 * @param {string} userId - ID of the user creating the event.
 * @returns {Promise<Object>} An object containing the created wallet and transaction.
 * @private
 * @throws {Error} If any part of the financial setup fails.
 */
const handleFinancialSetup = async (eventData, userId) => {
    try {
        const wallet = await createWalletForEvent(eventData._id, userId);
        const transaction = await createTransaction({
            eventId: eventData._id,
            userId,
            expectedAmount: eventData.entryFee,
            address: wallet.publicAddress
        });

        await createWebhook(transaction.address, transaction._id, eventData.requiredConfirmations);
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
