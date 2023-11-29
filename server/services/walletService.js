import bitcoin from "bitcoinjs-lib";
import * as ecc from "tiny-secp256k1";
import { ECPairFactory } from "ecpair";
import { storePrivateKey } from "../utils/storage.js";

/**
 * WalletService for managing cryptocurrency wallets.
 * Facilitates operations like creating new wallets, with a focus on SegWit wallets for Bitcoin.
 */
export class WalletService {
  /**
   * Initializes the WalletService with the appropriate network configuration.
   * This setup primarily uses Bitcoin's testnet for wallet-related operations.
   */
  constructor() {
    this.network = bitcoin.networks.testnet;
    this.ECPair = ECPairFactory(ecc);
  }

  /**
   * Creates a new Segregated Witness (SegWit) wallet using the Bitcoin testnet.
   * SegWit wallets are advantageous for their smaller transaction sizes and malleability fixes.
   *
   * @returns {Object} An object containing the new wallet's address and database ID.
   */
  async createSegwitWallet() {
    const keyPair = this.ECPair.makeRandom({ network: this.network });
    const { address } = bitcoin.payments.p2wpkh({
      pubkey: keyPair.publicKey,
      network: this.network,
    });

    const privateKey = keyPair.toWIF();
    const walletId = await storePrivateKey(address, privateKey);

    return { address, _id: walletId };
  }

  // Additional wallet management methods can be implemented as needed.
}

export default WalletService;
