import "server-only";
import { site } from "./site";

// Sends an email through Resend (https://resend.com). Until a Resend key is
// set, development logs the email instead, so the reset flow can still be
// tried locally.
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`\n[email not sent: no RESEND_API_KEY]\nTo: ${to}\nSubject: ${subject}\n\n${text}\n`);
      return;
    }
    throw new Error("RESEND_API_KEY must be set to send email.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      // Resend's shared test address works until the shop's own domain is
      // verified; it can only send to the Resend account's own email.
      from: process.env.EMAIL_FROM ?? `${site.name} <onboarding@resend.dev>`,
      to,
      subject,
      html,
      text,
    }),
  });
  if (!response.ok) throw new Error(`Resend failed: ${response.status} ${await response.text()}`);
}

const escape = (value: string) =>
  value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);

// The "reset your password" email: cream paper, a white card and one cherry
// button, like the log in page.
export function resetPasswordEmail(name: string, link: string) {
  const first = escape(name.split(/\s+/)[0] || "lovely");
  const url = escape(link);
  const html = `<!doctype html>
<html><body style="margin:0;background:#fbf3ef;font-family:Helvetica,Arial,sans-serif;color:#4a1420">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fbf3ef;padding:40px 16px">
    <tr><td align="center">
      <p style="margin:0 0 24px;font-size:18px;letter-spacing:4px;text-transform:uppercase;color:#b5123e;font-weight:600">${escape(site.name)}</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:460px;background:#ffffff;border-radius:24px">
        <tr><td style="padding:40px 36px">
          <p style="margin:0;font-family:Georgia,serif;font-size:34px;line-height:1.1;color:#4a1420">hi ${first} &#9825;</p>
          <p style="margin:16px 0 0;font-size:16px;line-height:1.6;color:#86535f">
            Someone (hopefully you) asked to reset your ${escape(site.name)} password.
            Tap below to choose a new one. The link works for 30 minutes.
          </p>
          <p style="margin:28px 0 0;text-align:center">
            <a href="${url}" style="display:inline-block;background:#b5123e;color:#ffffff;text-decoration:none;font-weight:600;font-size:16px;padding:15px 34px;border-radius:999px">Reset my password</a>
          </p>
          <p style="margin:28px 0 0;font-size:13px;line-height:1.6;color:#86535f">
            Button not working? Copy this link into your browser:<br>
            <a href="${url}" style="color:#b5123e;word-break:break-all">${url}</a>
          </p>
          <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#86535f">
            Didn't ask for this? You can ignore this email. Your password stays the same.
          </p>
        </td></tr>
      </table>
      <p style="margin:24px 0 0;font-size:12px;color:#86535f">xoxo, ${escape(site.name)}</p>
    </td></tr>
  </table>
</body></html>`;
  const text = [
    `Hi ${name.split(/\s+/)[0] || "lovely"},`,
    "",
    `Someone (hopefully you) asked to reset your ${site.name} password.`,
    "Open this link to choose a new one. It works for 30 minutes:",
    link,
    "",
    "Didn't ask for this? You can ignore this email. Your password stays the same.",
    "",
    `xoxo, ${site.name}`,
  ].join("\n");
  return { subject: `Reset your ${site.name} password`, html, text };
}
