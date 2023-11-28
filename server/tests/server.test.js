import request from "supertest";
import app from "../server.js";

describe("Server", () => {
  it("should be running and return a status code of 200", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toEqual(200);
  });
});
