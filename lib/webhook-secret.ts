// The base64 secret handed to Daily at webhook registration. Kept apart from
// lib/daily-webhook.ts so lib/env.ts can validate the value without pulling
// node:crypto into every module that reads the configuration.

const BASE64 = /^[A-Za-z0-9+/]+={0,2}$/;
const MIN_SECRET_BYTES = 16;

/** The bytes Daily keys its HMAC with, or null when the value is unusable. */
export function decodeWebhookSecret(value: string | undefined): Buffer | null {
  const trimmed = value?.trim() ?? "";
  if (!BASE64.test(trimmed)) return null;
  const bytes = Buffer.from(trimmed, "base64");
  return bytes.length >= MIN_SECRET_BYTES ? bytes : null;
}
