import type { Env } from "./auth";

export interface HistoryMsg {
  role: string;
  content: string;
}

export type ProviderName = "openai" | "anthropic" | "gemini";
export interface Attempt {
  provider: ProviderName;
  model: string;
}
export interface Completion {
  text: string;
  totalTokens: number;
  provider: ProviderName;
  model: string;
}

const MAX_OUTPUT = 800;
// Gemini models may spend hidden "thinking" tokens from the same budget, and the
// newer pro models cannot have thinking disabled — so give Gemini extra headroom
// to avoid truncated narration.
const GEMINI_MAX_OUTPUT = 2000;

// ---- role mappers -------------------------------------------------------

function toOpenAIMessages(systemPrompt: string, history: HistoryMsg[]) {
  const msgs: { role: string; content: string }[] = [{ role: "system", content: systemPrompt }];
  for (const m of history) {
    if (m.role === "system") continue;
    msgs.push({ role: m.role === "model" || m.role === "assistant" ? "assistant" : "user", content: m.content });
  }
  return msgs;
}

function toAnthropicMessages(history: HistoryMsg[]) {
  const msgs: { role: string; content: string }[] = [];
  for (const m of history) {
    if (m.role === "system") continue;
    msgs.push({ role: m.role === "model" || m.role === "assistant" ? "assistant" : "user", content: m.content });
  }
  // Anthropic requires the first message to be from the user.
  if (msgs.length && msgs[0].role === "assistant") {
    msgs.unshift({ role: "user", content: "Begin the adventure." });
  }
  return msgs;
}

function toGeminiContents(history: HistoryMsg[]) {
  const contents: { role: string; parts: { text: string }[] }[] = [];
  for (const m of history) {
    if (m.role === "system") continue;
    const role = m.role === "assistant" || m.role === "model" ? "model" : "user";
    const last = contents[contents.length - 1];
    if (last && last.role === role) last.parts[0].text += `\n\n${m.content}`;
    else contents.push({ role, parts: [{ text: m.content }] });
  }
  if (contents.length && contents[0].role === "model") {
    contents.unshift({ role: "user", parts: [{ text: "Begin the adventure." }] });
  }
  return contents;
}

// ---- provider callers (each throws on failure or missing key) ------------

async function callOpenAI(env: Env, model: string, systemPrompt: string, history: HistoryMsg[]) {
  if (!env.OPENAI_API_KEY) throw new Error("no_openai_key");
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${env.OPENAI_API_KEY}` },
    body: JSON.stringify({
      model,
      messages: toOpenAIMessages(systemPrompt, history),
      max_completion_tokens: MAX_OUTPUT,
    }),
  });
  if (!res.ok) throw new Error(`openai_${res.status}:${(await res.text().catch(() => "")).slice(0, 140)}`);
  const data = await res.json<any>();
  const text = data?.choices?.[0]?.message?.content || "";
  if (!text) throw new Error("openai_empty");
  return { text, totalTokens: data?.usage?.total_tokens || 200 };
}

async function callAnthropic(env: Env, model: string, systemPrompt: string, history: HistoryMsg[]) {
  if (!env.ANTHROPIC_API_KEY) throw new Error("no_anthropic_key");
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model, system: systemPrompt, messages: toAnthropicMessages(history), max_tokens: MAX_OUTPUT }),
  });
  if (!res.ok) throw new Error(`anthropic_${res.status}:${(await res.text().catch(() => "")).slice(0, 140)}`);
  const data = await res.json<any>();
  const text = data?.content?.[0]?.text || "";
  if (!text) throw new Error("anthropic_empty");
  return { text, totalTokens: (data?.usage?.input_tokens || 0) + (data?.usage?.output_tokens || 0) || 200 };
}

async function callGemini(env: Env, model: string, systemPrompt: string, history: HistoryMsg[]) {
  if (!env.DEV_GEMINI_KEY) throw new Error("no_gemini_key");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.DEV_GEMINI_KEY}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: toGeminiContents(history),
      systemInstruction: { parts: [{ text: systemPrompt }] },
      // NOTE: do NOT send thinkingConfig/thinkingBudget here. `gemini-pro-latest`
      // rejects a 0 budget outright ("This model only works in thinking mode"),
      // which would break the premium fallback. Instead we give a generous output
      // budget so hidden reasoning tokens can't starve the visible narration.
      generationConfig: { maxOutputTokens: GEMINI_MAX_OUTPUT, temperature: 0.7 },
    }),
  });
  if (!res.ok) throw new Error(`gemini_${res.status}:${(await res.text().catch(() => "")).slice(0, 140)}`);
  const data = await res.json<any>();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  if (!text) throw new Error("gemini_empty");
  return { text, totalTokens: data?.usageMetadata?.totalTokenCount || 200 };
}

// ---- cascade ------------------------------------------------------------

/**
 * Try each provider in order; return the first success. Providers whose key
 * isn't configured (or that error/time out) are skipped. Throws only if the
 * entire chain fails — the caller uses that to refund energy.
 */
export async function generate(
  env: Env,
  chain: Attempt[],
  systemPrompt: string,
  history: HistoryMsg[]
): Promise<Completion> {
  let lastErr: unknown;
  for (const { provider, model } of chain) {
    try {
      const fn = provider === "openai" ? callOpenAI : provider === "anthropic" ? callAnthropic : callGemini;
      const r = await fn(env, model, systemPrompt, history);
      return { ...r, provider, model };
    } catch (e) {
      lastErr = e;
      console.warn(`[cascade] ${provider}/${model} failed: ${(e as Error)?.message}`);
    }
  }
  throw new Error(`all_providers_failed: ${(lastErr as Error)?.message || "unknown"}`);
}
