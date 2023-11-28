import log from "../utils/log.js"; // Adjust the path accordingly

describe("Logger", () => {
  it("should have callable log methods", () => {
    expect(typeof log.info).toBe("function");
    expect(typeof log.error).toBe("function");
  });
});
