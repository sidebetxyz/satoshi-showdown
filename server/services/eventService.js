const Event = require("../schemas/eventModel"); // Adjust the path as needed
const { createSegwitWallet } = require("./wallet"); // For generating wallet addresses

const eventService = {
  async createEvent(eventData) {
    // Generate a Bitcoin address for the event creator
    const creatorWallet = await createSegwitWallet();
    eventData.creatorDepositAddress = creatorWallet.address;

    // Create the event
    const newEvent = new Event(eventData);
    await newEvent.save();
    return newEvent;
  },

  // Other event operations like updateEvent, addParticipant, etc.
};

module.exports = eventService;
