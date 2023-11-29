// Importing the necessary modules and utilities
import { connectToDB, disconnectDB } from "../utils/database.js";

/**
 * Tests for Database Connection
 *
 * These tests are designed to ensure the proper functioning of the database connection
 * utility. The database is a critical component of our backend infrastructure, and
 * reliable connectivity is essential for the application's performance and stability.
 */
describe("Database Connection Tests", () => {
  /**
   * Test: Successful Database Connection
   *
   * This test verifies that the 'connectToDB' function can establish a connection
   * to the MongoDB database without throwing an error. A successful connection is
   * fundamental for all data-driven operations in the app.
   */
  it("should connect to the database successfully", async () => {
    // The expectation is that calling 'connectToDB' should not result in an error.
    await expect(connectToDB()).resolves.not.toThrow();
  });

  /**
   * Cleanup: Disconnect from the Database
   *
   * After all tests in this suite are executed, we disconnect from the database
   * using the 'disconnectDB' function. This step is crucial to prevent open handles
   * which can affect other tests and lead to resource leaks during testing.
   */
  afterAll(async () => {
    await disconnectDB(); // Ensuring a clean disconnection from the database.
  });
});
