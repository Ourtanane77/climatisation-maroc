import { describe, expect, it } from "vitest";
import { clientIpFrom } from "./client-ip";

const h = (values: Record<string, string>) => new Headers(values);

describe("clientIpFrom", () => {
  it("trusts X-Real-IP, set by nginx", () => {
    expect(clientIpFrom(h({ "x-real-ip": "41.140.1.2", "x-forwarded-for": "10.0.0.1, 41.140.1.2" }))).toBe("41.140.1.2");
  });

  it("ignores a forged first X-Forwarded-For entry and takes the address nginx appended", () => {
    expect(clientIpFrom(h({ "x-forwarded-for": "10.0.0.1, 41.140.1.2" }))).toBe("41.140.1.2");
  });

  it("returns null without forwarding headers", () => {
    expect(clientIpFrom(h({}))).toBeNull();
  });
});
