// eventRoutes.js
/**
 * Routes for event management in Satoshi Showdown.
 *
 * Defines routes for handling event-related operations such as creating, updating, 
 * deleting, and retrieving events.
 */

const express = require('express');
const eventController = require('../controllers/eventController');

const router = express.Router();

// Create a new event
router.post('/create', eventController.createEvent);

// Update an event
router.put('/update/:id', eventController.updateEvent);

// Delete an event
router.delete('/delete/:id', eventController.deleteEvent);

// Get a specific event by ID
router.get('/get/:id', eventController.getEvent);

// Get all events
router.get('/getAll', eventController.getAllEvents);

module.exports = router;
