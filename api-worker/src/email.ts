import type { Env } from "./auth";

const FROM = "Shattered Saga <no-reply@shatteredsaga.com>";

export async function sendEmail(
  env: Env | undefined,
  msg: { to: string; subject: string; text: string }
): Promise<void> {
  const apiKey = env?.MAILGUN_API_KEY;
  const domain = env?.MAILGUN_DOMAIN;

  if (!apiKey || !domain) {
    console.log(`[email:dev] to=${msg.to} subject="${msg.subject}"\n${msg.text}`);
    return;
  }

  const auth = btoa(`api:${apiKey}`);
  const params = new URLSearchParams();
  params.append("from", FROM);
  params.append("to", msg.to);
  params.append("subject", msg.subject);
  params.append("text", msg.text);

  const res = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`[email] Mailgun failed ${res.status}: ${body}`);
  }
}
