# Shattered Saga — API Worker (Better Auth + D1)

Auth (email/password now; Google/Facebook in Phase 2) and the metered AI proxy
(Phase 3), running on Cloudflare Workers with a D1 database. BYOK play does NOT
use this Worker — it stays browser-direct to the provider.

## One-time setup (you run these — they need your Cloudflare login)

```bash
cd api-worker
npm install
npx wrangler login                      # authorize your Cloudflare account
```

Create the database and paste its id into `wrangler.toml` (`database_id`):

```bash
npx wrangler d1 create shattered-saga-db
```

Generate the Better Auth schema, build the migration, and apply it:

```bash
npm run auth:generate                   # writes src/db/auth.schema.ts from src/auth.ts
npm run db:generate                     # writes SQL migration into ./drizzle
npm run db:migrate:local                # apply to the local dev DB
```

Set the local dev secret (min 32 chars):

```bash
cp .dev.vars.example .dev.vars
# put `openssl rand -base64 32` output into BETTER_AUTH_SECRET in .dev.vars
```

## Run locally

```bash
npm run dev                             # http://localhost:8787
```

Smoke tests (email/password):

```bash
curl http://localhost:8787/api/health
# → {"ok":true,...}

curl -X POST http://localhost:8787/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"supersecret123","name":"Test"}'
```

A verification email is logged to the console in dev (Resend only sends when
`RESEND_API_KEY` is set). `requireEmailVerification` is currently `false` so you
can sign in immediately during testing — flip it on in `src/auth.ts` once the
Resend domain is verified.

## Deploy (production)

```bash
npm run db:migrate:remote               # apply schema to the remote D1
npx wrangler secret put BETTER_AUTH_SECRET
npx wrangler secret put RESEND_API_KEY
npx wrangler deploy
```

Then set `FRONTEND_URL` in `wrangler.toml` `[vars]` to the Cloudflare Pages app
origin so CORS + cookies are first-party.

## What's stubbed / next
- `POST /api/complete` returns 501 — the metered Free/Premium proxy is Phase 3.
- Google/Facebook providers — Phase 2 (add `socialProviders` in `src/auth.ts`
  + set the client id/secret secrets + configure the OAuth consoles).
- Frontend rewire to the Better Auth client SDK — Phase 4.
