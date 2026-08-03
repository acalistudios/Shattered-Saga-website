import type { Config } from "drizzle-kit";

// Generates SQL migrations (into ./drizzle) from the Better-Auth-generated
// Drizzle schema. Applied to D1 via `wrangler d1 migrations apply`.
export default {
  schema: "./src/db/auth.schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  driver: "d1-http",
} satisfies Config;
