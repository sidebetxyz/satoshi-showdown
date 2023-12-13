// envUtil.js
require("dotenv").config({ path: "../../configs/.env" });

const getEnv = (key, defaultValue = undefined) => {
  return process.env[key] || defaultValue;
};

module.exports = { getEnv };
