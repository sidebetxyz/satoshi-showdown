const { getDB } = require('../utils/database');

function WalletModel() {
    const db = getDB();
    return db.collection('wallets');
}

module.exports = WalletModel;
