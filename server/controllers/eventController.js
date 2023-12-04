/**
 * @fileoverview Controller for event-related operations in Satoshi Showdown.
 * This module handles incoming HTTP requests for event management, delegating business logic
 * to the Event Service.
 */

const {
    createEvent,
    updateEvent,
    deleteEvent,
    getEvent,
    getAllEvents
} = require('../services/eventService');
const { getOrCreateUserId } = require('../services/userService');

/**
 * Handles the creation of a new event.
 * 
 * @param {Request} req - The express request object.
 * @param {Response} res - The express response object.
 * @param {NextFunction} next - The express next middleware function.
 */
const handleCreateEvent = async (req, res, next) => {
    try {
        const eventData = req.body;
        const userId = await getOrCreateUserId(req);
        const newEvent = await createEvent(eventData, userId);
        res.status(201).json(newEvent);
    } catch (err) {
        next(err);
    }
};

/**
 * Handles updating an existing event.
 * 
 * @param {Request} req - The express request object.
 * @param {Response} res - The express response object.
 * @param {NextFunction} next - The express next middleware function.
 */
const handleUpdateEvent = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const updatedEvent = await updateEvent(id, updateData);
        res.json(updatedEvent);
    } catch (err) {
        next(err);
    }
};

/**
 * Handles deleting an event.
 * 
 * @param {Request} req - The express request object.
 * @param {Response} res - The express response object.
 * @param {NextFunction} next - The express next middleware function.
 */
const handleDeleteEvent = async (req, res, next) => {
    try {
        const { id } = req.params;
        await deleteEvent(id);
        res.status(200).send(`Event with ID ${id} deleted successfully`);
    } catch (err) {
        next(err);
    }
};

/**
 * Handles retrieving a specific event by ID.
 * 
 * @param {Request} req - The express request object.
 * @param {Response} res - The express response object.
 * @param {NextFunction} next - The express next middleware function.
 */
const handleGetEvent = async (req, res, next) => {
    try {
        const { id } = req.params;
        const event = await getEvent(id);
        res.json(event);
    } catch (err) {
        next(err);
    }
};

/**
 * Handles retrieving all events.
 * 
 * @param {Request} req - The express request object.
 * @param {Response} res - The express response object.
 * @param {NextFunction} next - The express next middleware function.
 */
const handleGetAllEvents = async (req, res, next) => {
    try {
        const events = await getAllEvents();
        res.json(events);
    } catch (err) {
        next(err);
    }
};

module.exports = {
    handleCreateEvent,
    handleUpdateEvent,
    handleDeleteEvent,
    handleGetEvent,
    handleGetAllEvents
};
