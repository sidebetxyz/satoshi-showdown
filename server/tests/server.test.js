import request from "supertest";
import app, { closeServer } from "../server.js"; // Importing the Express application and closeServer function

/**
 * Server Functionality Tests
 *
 * These tests verify the basic operational functionality of the Express server.
 * Ensuring that the server responds as expected is fundamental for application reliability.
 */
describe("Server Functionality Tests", () => {
  /**
   * Test: Server Availability
   *
   * Checks if the server responds to a basic GET request on the root route ('/').
   * A response with a 200 status code indicates the server is operational.
   */
  it("should be running and return a status code of 200", async () => {
    // Sending a GET request to the root route and expecting a 200 OK response.
    const res = await request(app).get("/");
    expect(res.statusCode).toEqual(200);
  });

  /**
   * After all tests are complete, close the server to free up resources.
   * This ensures that the server does not continue to listen on the port,
   * preventing potential issues in subsequent tests or operations.
   */
  afterAll(async () => {
    await closeServer(); // Close the server to stop listening on the port
  });
});
