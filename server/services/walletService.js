import bitcoin from "bitcoinjs-lib";
import ECPairFactory from "ecpair";
import ecc from "tiny-secp256k1";
import { storePrivateKey } from "../utils/storage.js";

// ECPair is a factory for Bitcoin keypairs
const ECPair = ECPairFactory(ecc);

/**
 * Service for handling wallet operations.
 * This includes creating new wallets, particularly SegWit wallets
 * for Bitcoin transactions.
 */
export class WalletService {
  constructor() {
    // Using Bitcoin's testnet for wallet operations
    this.network = bitcoin.networks.testnet;
  }

  /**
   * Creates a new Segregated Witness (SegWit) wallet.
   * SegWit wallets offer benefits like smaller transaction sizes
   * and malleability fixes.
   *
   * @returns {Object} An object containing the new wallet's address and its database ID.
   */
  async createSegwitWallet() {
    // Generate a random key pair for the wallet using the Bitcoin testnet
    const keyPair = ECPair.makeRandom({ network: this.network });

    // Derive the wallet's address from the public key
    const { address } = bitcoin.payments.p2wpkh({
      pubkey: keyPair.publicKey,
      network: this.network,
    });

    // Convert the private key to Wallet Import Format (WIF) for compatibility
    const privateKey = keyPair.toWIF();

    // Securely store the private key and retrieve the corresponding wallet ID
    const walletId = await storePrivateKey(address, privateKey);

    // Return the wallet's address and ID for further operations
    return { address, _id: walletId };
  }

  // Additional methods for wallet management can be added here
}

export default WalletService;
