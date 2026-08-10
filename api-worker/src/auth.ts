import { betterAuth } from "better-auth";
import { bearer } from "better-auth/plugins";
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
  // Phase 3 (metered proxy) — provider cascade keys:
  OPENAI_API_KEY?: string;    // primary (gpt-5.6-luna free / gpt-5.6-terra premium)
  ANTHROPIC_API_KEY?: string; // fallback (claude-haiku-4-5 / claude-sonnet-5)
  DEV_GEMINI_KEY?: string;    // fallback (gemini-flash-latest / gemini-pro-latest)

  // Stripe billing. Price ids are secrets so test/live modes differ without a
  // code change; the server resolves them from the plan name the client sends.
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  STRIPE_PRICE_SUPPORTER_MONTHLY?: string;
  STRIPE_PRICE_SUPPORTER_YEARLY?: string;
  STRIPE_PRICE_ADVENTURER_MONTHLY?: string;
  STRIPE_PRICE_ADVENTURER_YEARLY?: string;
  STRIPE_PRICE_LEGEND_MONTHLY?: string;
  STRIPE_PRICE_LEGEND_YEARLY?: string;
  STRIPE_PRICE_TURNS_200?: string;
  STRIPE_PRICE_TURNS_1500?: string;
  STRIPE_PRICE_GEMS_15?: string;
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
    trustedOrigins: [
      frontendUrl,
      "https://shatteredsaga.com",
      "https://www.shatteredsaga.com",
      // Cloudflare Pages staging alias, so deploys can be verified pre-cutover.
      "https://shattered-saga.pages.dev",
    ],
    // NOTE: `advanced` must NOT be set here. withCloudflare() is spread below and
    // returns its own `advanced` (for IP detection), which would overwrite this
    // key entirely — that silently dropped crossSubDomainCookies, so cookies were
    // issued host-only for api.shatteredsaga.com and never shared with the site.
    // It now lives inside the withCloudflare options object instead.
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
        socialProviders: {
          google: {
            clientId: env?.GOOGLE_CLIENT_ID as string,
            clientSecret: env?.GOOGLE_CLIENT_SECRET as string,
          },
          facebook: {
            clientId: env?.FACEBOOK_CLIENT_ID as string,
            clientSecret: env?.FACEBOOK_CLIENT_SECRET as string,
          },
        },
        // Inside withCloudflare's options so it survives the spread above.
        // Scopes auth cookies to .shatteredsaga.com, letting the site read the
        // session set by api.shatteredsaga.com after an OAuth redirect.
        advanced: {
          crossSubDomainCookies: {
            enabled: true,
            domain: ".shatteredsaga.com",
          },
        },
        rateLimit: { enabled: true, window: 60, max: 100 },
        // Bearer tokens let the static frontend authenticate cross-origin with
        // Authorization: Bearer <session-token> (no cross-site cookie needed).
        plugins: [bearer()],
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
