const Event = require('../models/eventModel');
const WalletService = require('./walletService');
const TransactionService = require('./transactionService');
const { ValidationError } = require('../utils/errorUtil');
const { eventValidator } = require('../utils/validationUtil');

const EventService = {
    async createEvent(eventData, userId) {
        // Set event start time to now if not provided or startNow flag is true
        if (!eventData.startTime || eventData.startNow) {
            eventData.startTime = new Date();
        }

        // Validate event data
        const validation = eventValidator.validate(eventData);
        if (validation.error) {
            throw new ValidationError('Invalid event data: ' + validation.error.details[0].message);
        }

        // Create and save the new event
        const newEvent = new Event({ ...eventData, creator: userId });
        await newEvent.save();

        // Handle wallet and transaction creation
        await this.handleWalletAndTransaction(newEvent, userId);

        return newEvent;
    },

    async handleWalletAndTransaction(newEvent, userId) {
        // Create a wallet for the event
        const wallet = await WalletService.createWalletForEvent(newEvent._id, userId);

        // Create a transaction record for the event
        await TransactionService.createTransaction({
            eventId: newEvent._id,
            userId,
            expectedAmount: newEvent.entryFee,
            address: wallet.publicAddress
        });
    }
};

module.exports = EventService;
