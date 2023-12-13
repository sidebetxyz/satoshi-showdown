// httpsUtil.js
const https = require("https");
const fs = require("fs");
const log = require("./logUtil");

const createServer = (app) => {
  try {
    const privateKey = fs.readFileSync(
      process.env.SSL_PRIVATE_KEY_PATH,
      "utf8",
    );
    const certificate = fs.readFileSync(
      process.env.SSL_CERTIFICATE_PATH,
      "utf8",
    );
    const credentials = { key: privateKey, cert: certificate };

    return https.createServer(credentials, app);
  } catch (err) {
    log.error(`HTTPS Server configuration error: ${err.message}`);
    throw err;
  }
};

module.exports = { createServer };
