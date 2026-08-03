// The Better Auth Drizzle schema is GENERATED — run:
//   npm run auth:generate
// which writes src/db/auth.schema.ts from the config in src/auth.ts.
// (Until you run it once, the import below won't resolve — that's expected.)
import * as authSchema from "./auth.schema";

export const schema = {
  ...authSchema,
} as const;
