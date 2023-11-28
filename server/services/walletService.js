const bitcoin = require("bitcoinjs-lib");
const ECPairFactory = require("ecpair").default;
const ecc = require("tiny-secp256k1");
const { storePrivateKey } = require("../utils/storage");

// ECPair is a factory for Bitcoin keypairs
const ECPair = ECPairFactory(ecc);

// Using Bitcoin's testnet for this service
const network = bitcoin.networks.testnet;

class WalletService {
  /**
   * Creates a new Segregated Witness (SegWit) wallet.
   * SegWit wallets allow for smaller transaction sizes and malleability fixes.
   * @returns {Object} An object containing the new wallet's address and its database ID.
   */
  async createSegwitWallet() {
    // Generate a random key pair for the wallet
    const keyPair = ECPair.makeRandom({ network });

    // Derive the wallet's address from the public key
    const { address } = bitcoin.payments.p2wpkh({
      pubkey: keyPair.publicKey,
      network,
    });

    // Convert the wallet's private key to Wallet Import Format (WIF)
    const privateKey = keyPair.toWIF();

    // Store the private key securely and retrieve the wallet's database ID
    const walletId = await storePrivateKey(address, privateKey);

    // Log the wallet's address and ID for debugging purposes
    console.log("Wallet created: Address -", address);
    console.log("Wallet ID -", walletId);

    // Return the wallet's address and database ID
    return { address, _id: walletId };
  }

  // Additional methods can be added here in the future
}

module.exports = WalletService;
