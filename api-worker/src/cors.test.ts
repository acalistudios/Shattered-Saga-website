import { describe, expect, it } from "vitest";
import app from "./index";
import type { Env } from "./auth";

// Preflights must complete before authentication or database access.
const env = { FRONTEND_URL: "https://preview.example.test" } as Env;
const preflight = (origin: string, method: string) =>
  app.request("https://api.shatteredsaga.com/api/saves/1", {
    method: "OPTIONS",
    headers: {
      Origin: origin,
      "Access-Control-Request-Method": method,
      "Access-Control-Request-Headers": "authorization,content-type",
    },
  }, env);

describe("credentialed cloud-save CORS", () => {
  it.each([
    "https://shatteredsaga.com",
    "https://www.shatteredsaga.com",
    "https://shattered-saga.pages.dev",
    "http://localhost:5185",
    "https://preview.example.test",
  ])("allows save operations from %s", async (origin: string) => {
    for (const method of ["PUT", "DELETE"]) {
      const response = await preflight(origin, method);
      expect(response.status).toBe(204);
      expect(response.headers.get("Access-Control-Allow-Origin")).toBe(origin);
      expect(response.headers.get("Access-Control-Allow-Credentials")).toBe("true");
      expect(response.headers.get("Access-Control-Allow-Methods")?.split(",")).toContain(method);
      expect(response.headers.get("Access-Control-Allow-Headers")?.split(",")).toEqual(["Content-Type", "Authorization"]);
      expect(response.headers.get("Vary")).toContain("Origin");
    }
  });

  it.each([
    "https://untrusted.example.test",
    "https://shatteredsaga.com.untrusted.example.test",
    "http://shatteredsaga.com",
    "null",
  ])("does not grant browser access to %s", async (origin: string) => {
    const response = await preflight(origin, "PUT");
    expect(response.headers.get("Access-Control-Allow-Origin")).toBeNull();
  });

  it("preserves authenticated POST preflights", async () => {
    const response = await preflight("https://shatteredsaga.com", "POST");
    expect(response.status).toBe(204);
    expect(response.headers.get("Access-Control-Allow-Methods")?.split(",")).toContain("POST");
  });

  it("adds credentialed CORS headers to actual responses", async () => {
    const response = await app.request("https://api.shatteredsaga.com/api/health", {
      headers: { Origin: "https://shatteredsaga.com" },
    }, env);
    expect(response.status).toBe(200);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe("https://shatteredsaga.com");
    expect(await response.json()).toEqual({ ok: true, service: "shattered-saga-api" });
  });
});
