const mongoose = require("mongoose");

const blockchainSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
  address: { type: String, required: true },
  transactionStatus: {
    type: String,
    enum: ["waiting", "processing", "complete", "canceled"],
    default: "waiting",
  },
  transactionInfo: {
    // Transaction details like amount, hash, etc.
  },
  timestamp: { type: Date, default: Date.now },
});

const Blockchain = mongoose.model("Blockchain", blockchainSchema);

module.exports = Blockchain;
