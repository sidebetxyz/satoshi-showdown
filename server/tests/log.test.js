import log, { stopLogger } from "../utils/log.js";

/**
 * Logger Utility Tests
 *
 * This suite tests the logger utility to ensure its proper functionality.
 * The logger is crucial for tracking application behavior and diagnosing issues.
 */
describe("Logger Utility Tests", () => {
  /**
   * Test: Logger Method Availability
   *
   * Checks that the logger has essential methods like 'info' and 'error'.
   * These methods are used for logging information and errors respectively.
   */
  it("should have callable log methods", () => {
    // Asserting that 'info' and 'error' methods are callable functions.
    expect(typeof log.info).toBe("function");
    expect(typeof log.error).toBe("function");
  });

  // Cleanup after tests
  afterAll(() => {
    stopLogger(); // Stopping the logger to release resources
  });
});
