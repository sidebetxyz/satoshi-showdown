/**
 * @fileoverview Service for managing wallets in Satoshi Showdown.
 * Provides functionalities for creating and managing cryptocurrency wallets,
 * specifically tailored for event-related transactions.
 */

const Wallet = require("../models/walletModel");
const { generateSegWitBitcoinKeys } = require("../utils/keyUtil");
const log = require("../utils/logUtil");

/**
 * Creates a wallet for a specific event and user.
 * Generates a new SegWit Bitcoin wallet and stores it in the database.
 *
 * @return {Promise<Object>} The created wallet object.
 */
const createSegWitWalletForEvent = async () => {
  const { address, encryptedPrivateKey } = generateSegWitBitcoinKeys();

  const wallet = new Wallet({
    publicAddress: address,
    encryptedPrivateKey,
    walletType: "SegWit",
  });

  await wallet.save();
  log.info(`Wallet created with address: ${wallet.publicAddress}`);
  return wallet;
};

module.exports = {
  createSegWitWalletForEvent,
};
