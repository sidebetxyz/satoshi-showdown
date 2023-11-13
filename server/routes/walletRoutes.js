const express = require('express');
const router = express.Router();
const { createSegwitWallet } = require('../services/wallet');
const { storePrivateKey } = require('../services/keyStorage');

router.get('/createWallet', async (req, res) => {
    const { address, privateKey } = createSegwitWallet();
    await storePrivateKey(address, privateKey);
    res.json({ address });
});

module.exports = router;
