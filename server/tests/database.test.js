import { connectToDB } from "../utils/database.js";

describe("Database Connection", () => {
  it("should connect to the database successfully", async () => {
    await expect(connectToDB()).resolves.not.toThrow();
  });
});
