const mongoose = require("mongoose");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");

const eventSchema = new mongoose.Schema({
  privateSerialNumber: {
    type: String,
    required: true,
    unique: true,
    default: () => crypto.randomBytes(16).toString("hex"),
  },
  publicId: {
    type: String,
    required: true,
    unique: true,
    default: uuidv4,
  },
  name: { type: String, required: true },
  description: String,
  type: { type: String, required: true },
  entryFee: { type: Number, required: true },
  maxParticipants: { type: Number, required: true },
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
  },
  participants: [
    {
      wallet: { type: mongoose.Schema.Types.ObjectId, ref: "Wallet" },
      transaction: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction" },
    },
  ],
});

const Event = mongoose.model("Event", eventSchema);
module.exports = Event;
