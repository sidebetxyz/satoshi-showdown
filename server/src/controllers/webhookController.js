/**
 * @fileoverview Webhook Controller for Satoshi Showdown.
 * This controller is specifically designed to manage the processing of incoming webhook callbacks.
 * It acts as the entry point for webhook data sent to the application, extracting necessary information
 * from the incoming requests and delegating the processing logic to the Webhook Service. This controller
 * ensures that webhook callbacks are parsed accurately and handled efficiently, with appropriate responses
 * sent back to the source of the webhook. It plays a crucial role in handling asynchronous events and
 * notifications that the application receives from external systems or services.
 *
 * @module controllers/webhookController
 * @requires services/webhookService - Service layer responsible for the business logic related to the processing of webhooks.
 */

const { processWebhook } = require("../services/webhookService");

/**
 * Handles the processing of received webhook callbacks.
 * This function extracts necessary data such as the unique ID and content of the webhook from the request,
 * and passes it to the Webhook Service for further processing. It ensures that the application responds
 * to the source of the webhook with an appropriate confirmation message, acknowledging the successful
 * reception and processing of the webhook data. This function is vital for the integration of external
 * services and systems that rely on webhooks to communicate events or updates to the application.
 *
 * @async
 * @function handleProcessWebhook
 * @param {express.Request} req - The Express request object containing the webhook data and unique identifier.
 * @param {express.Response} res - The Express response object used to send back a confirmation response.
 * @param {express.NextFunction} next - The Express next middleware function for error handling and propagation.
 * @return {Promise<void>} No explicit return value; the function sends a response to the source of the webhook.
 * @throws {Error} Propagates any errors encountered during webhook processing to the error handling middleware.
 */
const handleProcessWebhook = async (req, res, next) => {
  try {
    const { uniqueId } = req.params;
    const data = req.body;
    const headers = req.headers;
    await processWebhook(uniqueId, headers, data);
    res.status(200).send("Webhook processed successfully");
  } catch (err) {
    next(err); // Propagate error to centralized error handling middleware.
  }
};

module.exports = {
  handleProcessWebhook,
};
