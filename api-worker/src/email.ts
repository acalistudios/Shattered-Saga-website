import type { Env } from "./auth";

const FROM = "Shattered Saga <no-reply@shatteredsaga.com>";

/**
 * Minimal Resend transactional-email helper. If RESEND_API_KEY is not set
 * (local dev), it logs the message instead of sending so flows don't break.
 */
export async function sendEmail(
  env: Env | undefined,
  msg: { to: string; subject: string; text: string }
): Promise<void> {
  const apiKey = env?.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`[email:dev] to=${msg.to} subject="${msg.subject}"\n${msg.text}`);
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM, to: msg.to, subject: msg.subject, text: msg.text }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`[email] Resend failed ${res.status}: ${body}`);
  }
}
