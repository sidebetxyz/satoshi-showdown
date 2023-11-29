import mongoose from "mongoose";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";

// Schema for event management in the application
const eventSchema = new mongoose.Schema({
  privateSerialNumber: {
    type: String,
    required: true,
    unique: true,
    default: () => crypto.randomBytes(16).toString("hex"), // Internal unique identifier for the event
  },
  publicId: {
    type: String,
    required: true,
    unique: true,
    default: uuidv4, // Publicly visible identifier, used for external references
  },
  name: { type: String, required: true }, // Name of the event
  description: String, // Brief description of the event
  type: { type: String, required: true }, // Type/category of the event
  entryFee: { type: Number, required: true }, // Entry fee required for participation
  maxParticipants: { type: Number, required: true }, // Maximum number of participants allowed in the event
  startTime: { type: Date, default: Date.now }, // Scheduled start time of the event
  endTime: Date, // Scheduled end time of the event
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
  }, // Current status of the event
  participants: [
    {
      depositAddress: String, // Address for the participant's deposit
      transactionUniqueId: String, // Unique identifier for the transaction associated with the participant
      wallet: { type: mongoose.Schema.Types.ObjectId, ref: "Wallet" }, // Reference to the participant's wallet
    },
  ],
});

const Event = mongoose.model("Event", eventSchema);
export default Event;
