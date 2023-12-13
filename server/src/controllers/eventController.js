/**
 * @fileoverview Event Controller for Satoshi Showdown.
 * Manages HTTP requests for event-related operations such as creating, updating,
 * retrieving, and deleting events. This controller acts as an intermediary between
 * the client and the Event Service, handling the request and response cycle. It
 * extracts necessary information from client requests, passes it to the Event Service
 * for business logic processing, and then formats and returns responses.
 *
 * @module controllers/eventController
 * @requires services/eventService - Provides business logic for event-related operations.
 */

const {
  createEvent,
  updateEvent,
  deleteEvent,
  getEvent,
  getAllEvents,
} = require("../services/eventService");

/**
 * Handles the creation of a new event.
 * Validates user credentials and event data from the request body, invokes the Event Service
 * to create a new event, and returns the details of the created event in the response.
 *
 * @async
 * @function handleCreateEvent
 * @param {express.Request} req - Express request object containing event data and user credentials.
 * @param {express.Response} res - Express response object for sending back the created event data.
 * @param {express.NextFunction} next - Express next middleware function for error handling.
 * @return {Promise<void>} No explicit return value, sends response to the client.
 * @throws {Error} If user validation fails or event creation encounters issues.
 */
const handleCreateEvent = async (req, res, next) => {
  try {
    const { userAddress, userId, eventData } = req.body;

    if (!userId) {
      throw new Error("User not authenticated");
    }

    const newEvent = await createEvent(userAddress, userId, eventData);
    res.status(201).json(newEvent);
  } catch (err) {
    next(err);
  }
};

/**
 * Handles retrieving a specific event by its ID.
 * Extracts the event ID from the request parameters, queries the Event Service to retrieve the event,
 * and sends the event details in the response.
 *
 * @async
 * @function handleGetEvent
 * @param {express.Request} req - Express request object containing the event ID in parameters.
 * @param {express.Response} res - Express response object for sending back the retrieved event data.
 * @param {express.NextFunction} next - Express next middleware function for error handling.
 * @return {Promise<void>} No explicit return value, sends response to the client.
 * @throws {Error} If the event is not found or there's an issue retrieving it.
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
 * Handles retrieving all events from the system.
 * Calls the Event Service to retrieve a list of all events and sends this data in the response.
 *
 * @async
 * @function handleGetAllEvents
 * @param {express.Request} req - Express request object.
 * @param {express.Response} res - Express response object for sending back a list of all events.
 * @param {express.NextFunction} next - Express next middleware function for error handling.
 * @return {Promise<void>} No explicit return value, sends response to the client.
 * @throws {Error} If there's an issue retrieving the list of events.
 */
const handleGetAllEvents = async (req, res, next) => {
  try {
    const events = await getAllEvents();
    res.json(events);
  } catch (err) {
    next(err);
  }
};

/**
 * Handles updating an existing event.
 * Extracts the event ID and update data from the request, calls the Event Service to apply the updates,
 * and returns the updated event details in the response.
 *
 * @async
 * @function handleUpdateEvent
 * @param {express.Request} req - Express request object containing event ID and update data.
 * @param {express.Response} res - Express response object for sending back the updated event data.
 * @param {express.NextFunction} next - Express next middleware function for error handling.
 * @return {Promise<void>} No explicit return value, sends response to the client.
 * @throws {Error} If the event update encounters issues or the event is not found.
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
 * Handles deleting an event by its ID.
 * Extracts the event ID from the request parameters, invokes the Event Service to delete the event,
 * and sends a confirmation message upon successful deletion.
 *
 * @async
 * @function handleDeleteEvent
 * @param {express.Request} req - Express request object containing the event ID.
 * @param {express.Response} res - Express response object for sending back a deletion confirmation.
 * @param {express.NextFunction} next - Express next middleware function for error handling.
 * @return {Promise<void>} No explicit return value, sends response to the client.
 * @throws {Error} If the event deletion encounters issues or the event is not found.
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

module.exports = {
  handleCreateEvent,
  handleUpdateEvent,
  handleGetEvent,
  handleGetAllEvents,
  handleDeleteEvent,
};
