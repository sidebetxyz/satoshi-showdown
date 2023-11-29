import mongoose from "mongoose";

// Defines the schema for cryptocurrency wallets
const walletSchema = new mongoose.Schema({
  address: { type: String, required: true, unique: true }, // Unique blockchain address of the wallet
  uniqueId: { type: String, required: true, unique: true }, // Unique identifier for the wallet within our system
  privateKey: {
    iv: { type: String, required: true }, // Initialization vector for encrypted private key
    content: { type: String, required: true }, // Encrypted private key content
  },
  balance: { type: Number, default: 0 }, // Current balance of the wallet
  purpose: {
    type: String,
    required: true,
    enum: ["receiving", "prizePool", "refund", "other"],
  }, // Purpose of the wallet, defining its use case
  type: {
    type: String,
    required: true,
    enum: ["bitcoin", "testnetBitcoin", "dogecoin", "other"],
  }, // Type of cryptocurrency the wallet is for
  state: {
    type: String,
    required: true,
    enum: ["expecting", "processing", "completed", "inactive"],
    default: "expecting",
  }, // Current state of the wallet, particularly relevant for transaction processing
});

const Wallet = mongoose.model("Wallet", walletSchema);
export default Wallet;
