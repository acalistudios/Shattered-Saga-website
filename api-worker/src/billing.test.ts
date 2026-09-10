import { describe, expect, it } from "vitest";
import { isShatteredSagaStripeObject } from "./billing";

describe("Stripe application scoping", () => {
  it("accepts only the Shattered Saga tag", () => {
    expect(isShatteredSagaStripeObject({ app: "shattered-saga" })).toBe(true);
    expect(isShatteredSagaStripeObject({ app: "viastellis" })).toBe(false);
    expect(isShatteredSagaStripeObject({})).toBe(false);
    expect(isShatteredSagaStripeObject(null)).toBe(false);
  });
});
