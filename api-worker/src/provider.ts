import type { Env } from "./auth";

export interface HistoryMsg {
  role: string;
  content: string;
}

/** Convert the app's flat history into Gemini `contents` (merging consecutive same-role turns). */
function toGeminiContents(history: HistoryMsg[]) {
  const contents: { role: string; parts: { text: string }[] }[] = [];
  for (const msg of history) {
    if (msg.role === "system") continue;
    const role = msg.role === "assistant" || msg.role === "model" ? "model" : "user";
    const last = contents[contents.length - 1];
    if (last && last.role === role) {
      last.parts[0].text += `\n\n${msg.content}`;
    } else {
      contents.push({ role, parts: [{ text: msg.content }] });
    }
  }
  // Gemini requires the first turn to be from the user.
  if (contents.length > 0 && contents[0].role === "model") {
    contents.unshift({ role: "user", parts: [{ text: "Begin the adventure." }] });
  }
  return contents;
}

/** Call Gemini with the server-side key. Non-streaming for now (Phase 3). */
export async function callGemini(
  env: Env,
  model: string,
  systemPrompt: string,
  history: HistoryMsg[]
): Promise<{ text: string; totalTokens: number }> {
  const key = env.DEV_GEMINI_KEY;
  if (!key) throw new Error("server_key_missing");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: toGeminiContents(history),
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: { maxOutputTokens: 400, temperature: 0.7 },
    }),
  });

  if (!res.ok) {
    const err = await res.json<any>().catch(() => ({}));
    throw new Error(err?.error?.message || `gemini_error_${res.status}`);
  }

  const data = await res.json<any>();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const totalTokens = data?.usageMetadata?.totalTokenCount || 200;
  return { text, totalTokens };
}
