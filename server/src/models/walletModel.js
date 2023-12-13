/**
 * @fileoverview Wallet Model for Satoshi Showdown.
 * This model defines the structure and constraints for cryptocurrency wallets associated with users on the platform.
 * It includes critical details such as public addresses, encrypted private keys, wallet types, and balances.
 * The model also tracks associated transaction references, making it a key component in managing financial
 * activities and ensuring secure and efficient cryptocurrency transactions within the platform.
 *
 * @module models/Wallet
 * @requires mongoose - Mongoose library for MongoDB object modeling, offering schema definition and data validation.
 */

const mongoose = require("mongoose");

/**
 * Schema definition for the Wallet model.
 * Specifies the structure, data types, and validation rules for fields associated with a cryptocurrency wallet.
 * The schema includes fields for public address, encrypted private key, wallet type, and balances,
 * along with references to related transaction records. This schema design ensures the secure and
 * organized management of wallet-related data within the platform.
 *
 * @typedef {Object} WalletSchema
 * @property {string} publicAddress - Public address of the wallet, unique for each wallet.
 * @property {Object} encryptedPrivateKey - Encrypted private key details.
 * @property {string} encryptedPrivateKey.iv - Initialization vector for private key encryption.
 * @property {string} encryptedPrivateKey.content - Encrypted private key content.
 * @property {string} encryptedPrivateKey.tag - Authentication tag for encrypted private key.
 * @property {string} walletType - Type of the wallet, e.g., SegWit or Taproot.
 * @property {number} confirmedBalance - Confirmed balance of the wallet in cryptocurrency units.
 * @property {number} unconfirmedBalance - Unconfirmed balance of the wallet.
 * @property {mongoose.Schema.Types.ObjectId[]} transactionRefs - References to transactions associated with the wallet.
 *
 * @type {mongoose.Schema}
 */
const walletSchema = new mongoose.Schema(
  {
    publicAddress: { type: String, required: true, unique: true },
    encryptedPrivateKey: {
      iv: { type: String, required: true },
      content: { type: String, required: true },
      tag: { type: String, required: true },
    },
    walletType: {
      type: String,
      enum: ["SegWit", "Taproot"],
      required: true,
    },
    confirmedBalance: { type: Number, default: 0 },
    unconfirmedBalance: { type: Number, default: 0 },
    transactionRefs: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Transaction" },
    ],
  },
  { timestamps: true },
);

/**
 * Wallet model based on the defined schema.
 * Represents a cryptocurrency wallet in the Satoshi Showdown platform, encapsulating all necessary
 * data and functionalities related to wallet management, transaction tracking, and cryptographic security.
 * This model is central to the financial operations and integrity of the platform's cryptocurrency transactions.
 *
 * @typedef {mongoose.Model<module:models/Wallet~WalletSchema>} WalletModel
 */

/**
 * @type {WalletModel}
 */
const Wallet = mongoose.model("Wallet", walletSchema);

module.exports = Wallet;
