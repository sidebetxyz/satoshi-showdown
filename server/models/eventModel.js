const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  type: { type: String, required: true }, // e.g., matchup, contest, competition, wager
  entryFee: { type: Number, required: true },
  maxParticipants: { type: Number, required: true }, // Max number of participants
  startTime: { type: Date, required: true },
  endTime: Date,
  status: {
    type: String,
    enum: [
      "awaitingDeposit",
      "awaitingParticipants",
      "active",
      "finished",
      "settled",
      "cancelled",
    ],
    default: "awaitingDeposit",
    index: true, // Indexing the 'status' field
  },
  // Store participant addresses since we are not using user accounts
  participants: [{ type: String }],
  // Additional fields to manage Bitcoin transactions, like addresses or transaction IDs
  transactionDetails: {
    creatorDeposit: { type: String }, // Bitcoin transaction ID for creator's deposit
    participantDeposits: [{ type: String }], // Bitcoin transaction IDs for participants' deposits
  },
  creatorDepositAddress: { type: String, required: true, index: true }, // Address for the event creator's deposit
  participantDepositAddresses: [{ type: String }], // Addresses for each participant's deposit
});

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
