// utilityTestRunner.js
require("dotenv").config();

const log = require("../utils/logUtil");
const { connectToDB, disconnectDB } = require("../utils/databaseUtil");
const apiUtil = require("../utils/apiUtil");

const runTests = async () => {
  try {
    // Test Logging
    log.info("Info level log test");
    log.warn("Warn level log test");
    log.error("Error level log test");
    log.http("HTTP level log test");
    log.debug("Debug level log test");

    // Test Database Connection
    await connectToDB();
    log.info("Database connection test successful");
    await disconnectDB();
    log.info("Database disconnection test successful");

    // Test API Utility (Example with a mock function)
    const response = await apiUtil.get("https://example.com/api/test");
    log.info(`API GET test successful: ${response}`);
  } catch (err) {
    log.error(`Test failed: ${err.message}`);
  }
};

runTests();
