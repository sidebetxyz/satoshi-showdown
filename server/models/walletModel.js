const { getDB } = require('../services/db');

function WalletModel() {
    const db = getDB();
    return db.collection('wallets');
}

module.exports = WalletModel;
