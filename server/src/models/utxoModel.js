/**
 * @fileoverview UTXO Model for Satoshi Showdown.
 * This model defines the structure and constraints for UTXOs on the platform.
 * 
 *
 * @module models/UTXO
 * @requires mongoose - Mongoose library for MongoDB object modeling, offering schema definition and data validation.
 */

const mongoose = require("mongoose");

/**
 * UTXO Schema definition for Satoshi Showdown.
 * Represents Unspent Transaction Output (UTXO) data, crucial for tracking and managing cryptocurrency transactions.
 * Includes references to users, events, and wallets, along with key transactional data like address, amount, and blockchain information.
 *
 * @typedef {Object} UTXOSchema
 * @property {mongoose.Schema.Types.ObjectId} userRef - Reference to the User model, linking the UTXO to a specific user.
 * @property {mongoose.Schema.Types.ObjectId} eventRef - Reference to the Event model, associating the UTXO with a particular event.
 * @property {string} address - Address owning the UTXO.
 * @property {number} amount - Amount of cryptocurrency (in satoshis) represented by this UTXO.
 * @property {string} transactionHash - Hash of the transaction where this UTXO originated.
 * @property {number} outputIndex - Output index in the transaction (vout).
 * @property {string} scriptPubKey - ScriptPubKey for the output, defining how the UTXO can be spent.
 * @property {string} scriptType - Type of script, e.g., 'pay-to-pubkey-hash'.
 * @property {number} blockHeight - Block height at which this UTXO was mined (optional).
 * @property {Date} timestamp - Timestamp of when the transaction was confirmed.
 * @property {boolean} spent - Indicates if the UTXO has been spent.
 * @property {string} spendingTxHash - Transaction hash that spent this UTXO (if spent).
 * @property {boolean} refund - Marks the UTXO as part of a refund (optional).
 * @property {string} refundTxHash - Reference to the transaction that refunded this UTXO (if applicable).
 * @property {string} keyPath - HD wallet key path for this UTXO (optional).
 *
 * @type {mongoose.Schema}
 */
const UTXOSchema = new mongoose.Schema(
  {
    userRef: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    eventRef: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
    txRef: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction" },
    address: { type: String, required: true },
    amount: { type: Number, required: true },
    transactionHash: { type: String, required: true },
    outputIndex: { type: Number, required: true },
    scriptPubKey: { type: String, required: true },
    scriptType: { type: String, required: true },
    blockHeight: Number,
    timestamp: Date,
    spent: { type: Boolean, default: false },
    spendingTxHash: String,
    refund: { type: Boolean, default: false },
    refundTxHash: String,
    keyPath: { type: String, required: false },
  },
  { timestamps: true }
);

const UTXO = mongoose.model("UTXO", UTXOSchema);

module.exports = UTXO;
