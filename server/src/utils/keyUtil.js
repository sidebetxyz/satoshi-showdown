const bitcoin = require("bitcoinjs-lib");
const { BIP32Factory } = require("bip32");
const bip39 = require("bip39");
const ecc = require("tiny-secp256k1");
const { encryptPrivateKey } = require("./encryptionUtil");

// Define the network for testnet
const network = bitcoin.networks.testnet;

// Initialize bip32 with tiny-secp256k1
const bip32 = BIP32Factory(ecc);

/**
 * Generates a new HD wallet using BIP84 standard including the seed.
 * Uses BIP39 for mnemonic generation and BIP32 for key derivation.
 *
 * @function generateHDSegWitWalletWithSeed
 * @return {Object} An object containing the master public key, encrypted master private key,
 *                  encrypted seed, and derivation path.
 */
const generateHDSegWitWalletWithSeed = () => {
  const mnemonic = bip39.generateMnemonic();
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const root = bip32.fromSeed(seed, network);
  const masterPublicKey = root.neutered().toBase58();
  const encryptedMasterPrivateKey = encryptPrivateKey(root.toBase58());
  const encryptedSeed = encryptPrivateKey(mnemonic);
  const derivationPath = "m/84'/1'/0'"; // For reference (P2WSH) BIP84 Testnet Hardened Derivation Path

  return {
    masterPublicKey,
    encryptedMasterPrivateKey,
    encryptedSeed,
    derivationPath,
  };
};

/**
 * Generate a child address from the master key using a specified derivation path.
 * This function supports generating P2WSH addresses.
 *
 * @function generateChildAddress
 * @param {string} masterPublicKey - The master public key of the HD wallet.
 * @param {number} childIndex - The index of the child key to generate.
 * @return {Object} An object containing the child address and derivation path.
 */
const generateChildAddress = (masterPublicKey, childIndex) => {
  const node = bip32.fromBase58(masterPublicKey, network);

  // Adjust the derivation path to include the child index for non-hardened derivation
  const derivationPath = `m/84/1/0/0/${childIndex}`; // Updated for BIP84 (P2WSH)
  const child = node.derivePath(derivationPath);

  // Create the witness script (This is a simple example, using a single pubkey)
  const witnessScript = bitcoin.payments.p2wpkh({
    pubkey: child.publicKey,
    network,
  }).output;

  // Generate the P2WSH address
  const address = bitcoin.payments.p2wsh({
    redeem: { output: witnessScript, network },
    network,
  }).address;

  return { address, path: derivationPath };
};

module.exports = {
  generateHDSegWitWalletWithSeed,
  generateChildAddress,
};
