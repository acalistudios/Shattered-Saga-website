# Shattered Saga — Backend Deploy Runbook

Goal: move the app out of "Local Simulation" so real accounts, the Free (ad) engine,
and Premium tiers work. BYOK already works browser-direct and needs none of this.

Legend: 🧑 = you do it (needs your accounts) · 🤖 = Claude can do/help once values exist.

---

## Phase 1 — Supabase project (auth + profiles + energy)
1. 🧑 Create a Supabase project (or reuse one). Region close to your users.
2. 🧑 SQL Editor → paste and run `supabase/schema.sql` (already fixed to include the
   `supporter` tier). This creates `profiles`, `transactions`, the energy RPCs, and the
   `on_auth_user_created` trigger that auto-provisions a profile with 100 welcome energy.
3. 🧑 Project Settings → API → copy:
   - Project URL  → `VITE_SUPABASE_URL`
   - `anon` public key → `VITE_SUPABASE_ANON_KEY`
   - `service_role` key → Worker secret `SUPABASE_SERVICE_ROLE_KEY` (server-only!)
4. 🤖 Give me the URL + anon key and I'll wire `.env` locally so we can test auth.

## Phase 2 — Shared Gemini key (Free/Premium engine)
1. 🧑 Get a valid key at https://aistudio.google.com/app/apikey (format `AIza…`).
   The current `.env` value `AQ.Ab8…` is an OAuth token, not an API key — it won't work.
2. This one key is used two ways: frontend `VITE_GEMINI_API_KEY` and Worker `DEV_GEMINI_KEY`.

## Phase 3 — Cloudflare Worker proxy (server-metered turns)
Run from the `website/` folder:
1. 🧑 `npx wrangler login`  (opens browser; authorizes your Cloudflare account)
2. 🧑 Set secrets (each prompts for the value):
   - `npx wrangler secret put SUPABASE_URL`
   - `npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY`
   - `npx wrangler secret put DEV_GEMINI_KEY`
   - (optional) `DEV_GROQ_KEY`, `DEV_CEREBRAS_KEY`
3. 🧑 `npx wrangler deploy`  → note the printed Worker URL
   (e.g. `https://shattered-saga-proxy.<subdomain>.workers.dev`).
4. 🤖 I'll confirm the Worker responds and matches the client's expected shape.

## Phase 4 — GitHub build secrets (deployed site)
1. 🧑 Repo → Settings → Secrets and variables → Actions → add:
   - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_GEMINI_API_KEY`, `VITE_PROXY_URL`
   (the workflow already reads all four).
2. 🧑 Re-run the deploy (push any commit, or re-run the last Action).

## Phase 5 — OAuth providers (Google + Facebook)  ← objective 1
Only needed for social login; email/password works with just Phase 1.
1. 🧑 Supabase → Authentication → URL Configuration → add your site URL(s) to
   **Redirect URLs** (GitHub Pages URL, and http://localhost:5185 for local).
2. 🧑 Google: GCP Console → OAuth consent + Credentials → Web client. Authorized redirect URI =
   `https://<project-ref>.supabase.co/auth/v1/callback`. Copy client id/secret into
   Supabase → Auth → Providers → Google.
3. 🧑 Facebook: Meta for Developers → app → Facebook Login → Valid OAuth redirect URI =
   same Supabase `/auth/v1/callback`. Copy app id/secret into Supabase → Providers → Facebook.
4. ⚠️ Supabase defaults to the PKCE flow (`?code=`), but the app currently parses the
   implicit flow (`#access_token`). We must confirm/adjust one of them — flagged for the
   OAuth pass; I'll handle the code side.

## Phase 6 — Verify
- 🤖 Sign up (email/pw) → confirm a `profiles` row appears with 100 energy.
- 🤖 Play a Free-tier turn → confirm the Worker decrements energy and returns narration.
- 🤖 Then we add the signup + Account tier picker (your chosen next feature).

---

### Notes / known follow-ups
- Worker streaming is one-shot (it buffers the provider response); functional but not
  incremental. Low priority polish.
- Paid tiers ($1/$5/$15) selectable in the picker will need real billing (Stripe) to
  actually charge; in simulation they just set the tier. Separate effort.
