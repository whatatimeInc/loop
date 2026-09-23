import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildConfirmationEmail,
  confirmationIdempotencyKey,
  formatSessionWhen,
  resendConfig,
  sessionIcs,
  shouldAwaitConfirmationMark,
  siteUrlFrom,
} from "./confirmation-email.ts";

// ── config ──────────────────────────────────────────────────────────────────

test("resendConfig is null when the API key is missing", () => {
  assert.equal(resendConfig({ RESEND_FROM: "Loop.Talk <a@b.c>" }), null);
});

test("resendConfig is null when the sender is blank", () => {
  assert.equal(resendConfig({ RESEND_API_KEY: "re_x", RESEND_FROM: "   " }), null);
});

test("resendConfig trims both values", () => {
  assert.deepEqual(resendConfig({ RESEND_API_KEY: " re_x ", RESEND_FROM: " Loop.Talk <a@b.c> " }), {
    apiKey: "re_x",
    from: "Loop.Talk <a@b.c>",
  });
});

test("siteUrlFrom strips trailing slashes and falls back to localhost", () => {
  assert.equal(siteUrlFrom({ NEXT_PUBLIC_SITE_URL: "https://loop.example//" }), "https://loop.example");
  assert.equal(siteUrlFrom({}), "http://localhost:3100");
});

// ── when ────────────────────────────────────────────────────────────────────

test("formatSessionWhen renders the Brasília wall clock in Portuguese", () => {
  // 17:00Z is 14:00 in America/Sao_Paulo (UTC-3, no DST since 2019).
  assert.deepEqual(formatSessionWhen("2026-09-24T17:00:00.000Z"), {
    weekday: "quinta-feira",
    date: "24 de setembro de 2026",
    time: "14:00",
  });
});

test("formatSessionWhen crosses the day boundary in the zone, not in UTC", () => {
  // 01:30Z on the 25th is still 22:30 on the 24th in Brasília.
  assert.deepEqual(formatSessionWhen("2026-09-25T01:30:00.000Z"), {
    weekday: "quinta-feira",
    date: "24 de setembro de 2026",
    time: "22:30",
  });
});

// ── ics ─────────────────────────────────────────────────────────────────────

const ICS_INPUT = {
  id: "0f5a7c1e-2b6d-4f3a-9c8e-1d2e3f4a5b6c",
  startsAt: "2026-09-24T17:00:00.000Z",
  durationMinutes: 45,
  mentorName: "Vanessa Machado",
  roomUrl: "https://loop.example/sala/0f5a7c1e-2b6d-4f3a-9c8e-1d2e3f4a5b6c",
  now: new Date("2026-09-23T12:00:00.000Z"),
};

test("sessionIcs uses CRLF line endings and the UTC stamps of start, end and now", () => {
  const ics = sessionIcs(ICS_INPUT);
  const lines = ics.split("\r\n");
  assert.equal(lines[0], "BEGIN:VCALENDAR");
  assert.equal(lines[lines.length - 1], "END:VCALENDAR");
  assert.ok(!ics.includes("\n\n"), "no bare LF");
  assert.ok(!/[^\r]\n/.test(ics), "every LF is preceded by CR");
  assert.ok(lines.includes("DTSTART:20260924T170000Z"));
  assert.ok(lines.includes("DTEND:20260924T174500Z"));
  assert.ok(lines.includes("DTSTAMP:20260923T120000Z"));
  assert.ok(lines.includes(`UID:${ICS_INPUT.id}@looptalk`));
  assert.ok(lines.includes("PRODID:-//Loop.Talk//PT"));
  assert.ok(lines.includes("SUMMARY:Loop.Talk com Vanessa Machado"));
  assert.ok(lines.includes(`URL:${ICS_INPUT.roomUrl}`));
});

test("sessionIcs escapes RFC 5545 special characters in text values", () => {
  const ics = sessionIcs({ ...ICS_INPUT, mentorName: "Silva, José; \\ok" });
  const summary = ics.split("\r\n").find((l) => l.startsWith("SUMMARY:"));
  assert.equal(summary, String.raw`SUMMARY:Loop.Talk com Silva\, José\; \\ok`);
});

test("sessionIcs folds lines longer than 75 octets", () => {
  const ics = sessionIcs({ ...ICS_INPUT, roomUrl: "https://loop.example/sala/" + "a".repeat(80) });
  for (const line of ics.split("\r\n")) {
    assert.ok(Buffer.byteLength(line, "utf8") <= 75, `line too long: ${line}`);
  }
  // Unfolding (remove CRLF + single space) restores the original property.
  const unfolded = ics.replace(/\r\n[ \t]/g, "");
  assert.ok(unfolded.includes("URL:https://loop.example/sala/" + "a".repeat(80)));
});

// ── message ─────────────────────────────────────────────────────────────────

const EMAIL_INPUT = {
  from: "Loop.Talk <sessoes@loop.example>",
  to: "ana@example.com",
  guestName: "Ana",
  session: { ...ICS_INPUT },
};

test("buildConfirmationEmail addresses the guest from the configured sender", () => {
  const email = buildConfirmationEmail(EMAIL_INPUT);
  assert.equal(email.from, EMAIL_INPUT.from);
  assert.deepEqual(email.to, ["ana@example.com"]);
});

test("buildConfirmationEmail subject names the mentor and the date", () => {
  const email = buildConfirmationEmail(EMAIL_INPUT);
  assert.ok(email.subject.includes("Vanessa Machado"), email.subject);
  assert.ok(email.subject.includes("24 de setembro"), email.subject);
});

test("buildConfirmationEmail text carries when, duration and the room link", () => {
  const { text } = buildConfirmationEmail(EMAIL_INPUT);
  assert.ok(text.includes("quinta-feira, 24 de setembro de 2026"), text);
  assert.ok(text.includes("14:00"), text);
  assert.ok(text.includes("45 min"), text);
  assert.ok(text.includes(ICS_INPUT.roomUrl), text);
  assert.ok(text.includes("Olá, Ana"), text);
});

test("buildConfirmationEmail html escapes interpolated values", () => {
  const { html } = buildConfirmationEmail({ ...EMAIL_INPUT, guestName: "<b>Ana</b>", session: { ...ICS_INPUT, mentorName: "A & B" } });
  assert.ok(!html.includes("<b>Ana</b>"), "guest name must be escaped");
  assert.ok(html.includes("&lt;b&gt;Ana&lt;/b&gt;"));
  assert.ok(html.includes("A &amp; B"));
  assert.ok(html.includes(`href="${ICS_INPUT.roomUrl}"`));
});

test("buildConfirmationEmail greets generically without a guest name", () => {
  const { text } = buildConfirmationEmail({ ...EMAIL_INPUT, guestName: null });
  assert.ok(text.startsWith("Olá!"), text);
});

test("buildConfirmationEmail attaches the ICS as base64 text/calendar", () => {
  const email = buildConfirmationEmail(EMAIL_INPUT);
  assert.equal(email.attachments.length, 1);
  const [att] = email.attachments;
  assert.equal(att.filename, "loop-talk-sessao.ics");
  assert.equal(att.contentType, "text/calendar; charset=utf-8; method=PUBLISH");
  assert.equal(typeof att.content, "string");
  assert.equal(Buffer.from(att.content, "base64").toString("utf8"), sessionIcs(ICS_INPUT));
});

test("confirmationIdempotencyKey is stable per session", () => {
  assert.equal(confirmationIdempotencyKey("abc"), "session-confirmation/abc");
});

// ── confirmation page wait ──────────────────────────────────────────────────

test("shouldAwaitConfirmationMark is true only for a fresh booking with mail configured", () => {
  const now = new Date("2026-09-23T12:00:30.000Z");
  assert.equal(shouldAwaitConfirmationMark({ createdAt: "2026-09-23T12:00:00.000Z", mailConfigured: true, now }), true);
  assert.equal(shouldAwaitConfirmationMark({ createdAt: "2026-09-23T11:58:00.000Z", mailConfigured: true, now }), false);
  assert.equal(shouldAwaitConfirmationMark({ createdAt: "2026-09-23T12:00:00.000Z", mailConfigured: false, now }), false);
  assert.equal(shouldAwaitConfirmationMark({ createdAt: "not a date", mailConfigured: true, now }), false);
});
