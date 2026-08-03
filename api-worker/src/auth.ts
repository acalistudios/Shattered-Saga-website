import { betterAuth } from "better-auth";
import { withCloudflare } from "better-auth-cloudflare";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { drizzle } from "drizzle-orm/d1";
import { schema } from "./db/schema";
import { sendEmail } from "./email";

export interface Env {
  DATABASE: D1Database;
  BETTER_AUTH_SECRET: string;
  RESEND_API_KEY?: string;
  FRONTEND_URL?: string;
  // Phase 2 (social):
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  FACEBOOK_CLIENT_ID?: string;
  FACEBOOK_CLIENT_SECRET?: string;
  // Phase 3 (metered proxy):
  DEV_GEMINI_KEY?: string;
}

/**
 * Build the Better Auth instance.
 *
 * Called two ways:
 *  - At runtime with the Worker `env` + request `cf` + resolved baseURL.
 *  - By the `@better-auth/cli` (no env) so it can read the config and generate
 *    the Drizzle schema. In that mode we hand it a stub drizzle adapter.
 */
export function createAuth(env?: Env, cf?: IncomingRequestCfProperties, baseURL?: string) {
  const db = env ? drizzle(env.DATABASE, { schema, logger: false }) : ({} as any);
  const frontendUrl = env?.FRONTEND_URL || "http://localhost:5185";

  return betterAuth({
    baseURL,
    secret: env?.BETTER_AUTH_SECRET,
    // Allow the static frontend origin to call this API and receive cookies.
    trustedOrigins: [frontendUrl],
    // App-specific columns stored on the user row (metering + billing).
    user: {
      additionalFields: {
        subscription_tier: { type: "string", defaultValue: "free", input: false },
        energy_balance: { type: "number", defaultValue: 100, input: false },
      },
    },
    ...withCloudflare(
      {
        autoDetectIpAddress: true,
        geolocationTracking: false,
        cf: cf || {},
        d1: env
          ? { db, options: { usePlural: true, debugLogs: false } }
          : undefined,
      },
      {
        emailAndPassword: {
          enabled: true,
          // Flip to true once the Resend sending domain is verified (Phase 1 finish).
          requireEmailVerification: false,
          sendResetPassword: async ({ user, url }) => {
            await sendEmail(env, {
              to: user.email,
              subject: "Reset your Shattered Saga password",
              text: `Reset your password:\n\n${url}\n\nIf you didn't request this, ignore this email.`,
            });
          },
        },
        emailVerification: {
          sendOnSignUp: true,
          sendVerificationEmail: async ({ user, url }) => {
            await sendEmail(env, {
              to: user.email,
              subject: "Verify your Shattered Saga account",
              text: `Welcome, adventurer. Confirm your email to begin:\n\n${url}`,
            });
          },
        },
        rateLimit: { enabled: true, window: 60, max: 100 },
      }
    ),
    // CLI-only fallback so `better-auth generate` can introspect the schema
    // without a live D1 binding.
    ...(env
      ? {}
      : {
          database: drizzleAdapter({} as any, {
            provider: "sqlite",
            usePlural: true,
          }),
        }),
  });
}

// Used by the Better Auth CLI (no runtime env).
export const auth = createAuth();
