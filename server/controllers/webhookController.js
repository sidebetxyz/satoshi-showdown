/**
 * @fileoverview Controller for handling webhook callbacks in Satoshi Showdown.
 * This module processes incoming webhook callbacks, delegating business logic to the Webhook Service.
 */

const { processWebhook } = require('../services/webhookService');

/**
 * Handles the processing of received webhook callbacks.
 * 
 * @param {Request} req - The express request object. Contains the webhook data and uniqueId.
 * @param {Response} res - The express response object. Used to send back a response.
 * @param {NextFunction} next - The express next middleware function for error handling.
 */
const handleProcessWebhook = async (req, res, next) => {
    try {
        const { uniqueId } = req.params;
        const data = req.body;
        const headers = req.headers;
        await processWebhook(uniqueId, headers, data);
        res.status(200).send('Webhook processed successfully');
    } catch (err) {
        next(err);
    }
};

module.exports = {
    handleProcessWebhook
};
