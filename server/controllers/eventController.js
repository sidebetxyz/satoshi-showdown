// eventController.js
/**
 * Handles incoming HTTP requests related to event operations,
 * delegating business logic to the Event Service.
 */

const eventService = require('../services/eventService');
const userService = require('../services/userService');

const EventController = {
    // Create a new event
    async createEvent(req, res, next) {
        try {
            const eventData = req.body;
            const userId = await userService.getOrCreateUserId(req);
            const newEvent = await eventService.createEvent(eventData, userId);
            res.status(201).json(newEvent);
        } catch (error) {
            next(error);
        }
    },

    // Update an event
    async updateEvent(req, res, next) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            const updatedEvent = await eventService.updateEvent(id, updateData);
            res.json(updatedEvent);
        } catch (error) {
            next(error);
        }
    },

    // Delete an event
    async deleteEvent(req, res, next) {
        try {
            const { id } = req.params;
            await eventService.deleteEvent(id);
            res.status(200).send(`Event with ID ${id} deleted successfully`);
        } catch (error) {
            next(error);
        }
    },

    // Get a specific event by ID
    async getEvent(req, res, next) {
        try {
            const { id } = req.params;
            const event = await eventService.getEvent(id);
            res.json(event);
        } catch (error) {
            next(error);
        }
    },

    // Get all events
    async getAllEvents(req, res, next) {
        try {
            const events = await eventService.getAllEvents();
            res.json(events);
        } catch (error) {
            next(error);
        }
    }
};

module.exports = EventController;
