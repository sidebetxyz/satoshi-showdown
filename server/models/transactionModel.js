import mongoose from "mongoose";

// Schema for blockchain transactions associated with wallets
const transactionSchema = new mongoose.Schema({
  address: { type: String, required: true }, // Blockchain address involved in the transaction
  uniqueId: { type: String, required: true, unique: true }, // Unique identifier for the transaction, used for user interaction without registration
  wallet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Wallet",
    required: true,
  }, // Wallet associated with the transaction
  expectedAmount: { type: Number, required: true }, // Expected amount of cryptocurrency for the transaction
  receivedAmount: { type: Number, default: 0 }, // Actual received amount, used for validation
  status: {
    type: String,
    enum: ["waiting", "processing", "completed", "cancelled"],
    default: "waiting",
  }, // Status of the transaction, indicating its current phase
  createdTimestamp: { type: Date, default: Date.now }, // Timestamp when the transaction was created
  startedConfirmingTimestamp: Date, // Timestamp indicating when the transaction started confirming on the blockchain
  completedAtTimestamp: Date, // Timestamp when the transaction reached the required number of confirmations
});

const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;
