import mongoose from "mongoose";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";

/**
 * Event Schema
 *
 * The Event schema is designed to represent and manage gaming events within the application.
 * It includes various fields to capture essential details about each event, including unique identifiers,
 * event-specific information, participant data, and more.
 */
const eventSchema = new mongoose.Schema({
  // A private, internal unique identifier for the event, generated using random bytes for enhanced security.
  privateSerialNumber: {
    type: String,
    required: true,
    unique: true,
    default: () => crypto.randomBytes(16).toString("hex"),
  },
  // A public identifier for external reference, generated using UUID v4.
  publicId: {
    type: String,
    required: true,
    unique: true,
    default: uuidv4,
  },
  // The name of the event, providing a clear and descriptive title.
  name: { type: String, required: true },
  // An optional description of the event, offering further details about what participants can expect.
  description: String,
  // The type of event, categorizing the event for easier management and user understanding.
  type: { type: String, required: true },
  // The entry fee required for participation, essential for prize pool management.
  entryFee: { type: Number, required: true },
  // The maximum number of participants allowed, ensuring event scalability.
  maxParticipants: { type: Number, required: true },
  // The minimum number of participants required for the event to proceed.
  minParticipants: { type: Number, default: 1 },
  // The scheduled start time of the event, providing clarity on when the event will commence.
  startTime: { type: Date, default: Date.now },
  // The scheduled end time of the event, allowing for time-bound events.
  endTime: Date,
  // The duration of the event in minutes, providing flexibility in event timing.
  eventLength: { type: Number },
  // The current status of the event, tracking its lifecycle from creation to conclusion.
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
  // An array of participants, each with essential details like wallet and transaction information.
  participants: [
    {
      depositAddress: String, // Address for the participant's deposit.
      transactionUniqueId: String, // Unique identifier for the related transaction.
      wallet: { type: mongoose.Schema.Types.ObjectId, ref: "Wallet" }, // Reference to the participant's wallet.
    },
  ],
});

const Event = mongoose.model("Event", eventSchema);
export default Event;
