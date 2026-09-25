import { test } from "node:test";
import assert from "node:assert/strict";
import {
  acceptedMinutes,
  effectiveDuration,
  extendedWindow,
  extensionAllowance,
  EXTENSION_OFFER_WINDOW_MS,
  MAX_EXTENSION_MINUTES,
  requestOutcome,
  respondPermission,
  roomExpiryFor,
  shouldOfferExtension,
} from "./extensions.ts";
import { entryWindow } from "./sala-window.ts";

const rows = [
  { minutes_added: 5, status: "accepted" },
  { minutes_added: 10, status: "declined" },
  { minutes_added: 15, status: "accepted" },
  { minutes_added: 5, status: "pending" },
];

test("acceptedMinutes sums only accepted rows", () => {
  assert.equal(acceptedMinutes(rows), 20);
  assert.equal(acceptedMinutes([]), 0);
});

test("effectiveDuration adds accepted minutes to the booked duration", () => {
  assert.equal(effectiveDuration(30, rows), 50);
  assert.equal(effectiveDuration(45, []), 45);
});

test("extendedWindow equals the entry window of the effective duration", () => {
  const start = "2026-09-24T17:00:00.000Z";
  assert.deepEqual(extendedWindow(start, 30, rows, 10), entryWindow(start, 50, 10));
  assert.equal(extendedWindow(start, 30, rows, 10).endsAt, new Date("2026-09-24T17:50:00.000Z").getTime());
});

test("roomExpiryFor keeps the booking rule: start + effective duration + 90 min", () => {
  const exp = roomExpiryFor("2026-09-24T17:00:00.000Z", 50);
  assert.equal(exp.toISOString(), "2026-09-24T19:20:00.000Z");
});

test("respondPermission lets only the other participant answer", () => {
  assert.equal(respondPermission({ requestedBy: "guest", callerPersona: "mentor" }), "ok");
  assert.equal(respondPermission({ requestedBy: "mentor", callerPersona: "guest" }), "ok");
  assert.equal(respondPermission({ requestedBy: "guest", callerPersona: "guest" }), "own-request");
});

test("requestOutcome reports the state of one request among the session's rows", () => {
  const rows = [
    { id: "a", minutes_added: 5, status: "accepted" },
    { id: "b", minutes_added: 10, status: "declined" },
    { id: "c", minutes_added: 15, status: "pending" },
  ];
  assert.equal(requestOutcome(rows, "a"), "accepted");
  assert.equal(requestOutcome(rows, "b"), "declined");
  assert.equal(requestOutcome(rows, "c"), "pending");
  assert.equal(requestOutcome(rows, "zzz"), "missing");
});

test("extensionAllowance caps the total accepted minutes at MAX_EXTENSION_MINUTES", () => {
  assert.equal(MAX_EXTENSION_MINUTES, 60);
  const accepted = (n: number) => Array.from({ length: n }, () => ({ minutes_added: 15, status: "accepted" }));
  assert.equal(extensionAllowance(accepted(0), 15), "ok");
  assert.equal(extensionAllowance(accepted(3), 15), "ok");        // 45 + 15 = 60, allowed
  assert.equal(extensionAllowance(accepted(4), 5), "limit-reached"); // 60 + 5 > 60
  assert.equal(extensionAllowance([{ minutes_added: 15, status: "declined" }], 15), "ok");
});

// ── when the "ask for more time" banner is offered ──────────────────────────

test("shouldOfferExtension offers the banner through the last minutes, not only at the 5:00 tick", () => {
  assert.equal(EXTENSION_OFFER_WINDOW_MS, 5 * 60_000);
  const offer = (remainingMs: number, requestPending = false) => shouldOfferExtension({ remainingMs, requestPending });
  assert.equal(offer(5 * 60_000), true);        // exactly at the threshold
  assert.equal(offer(4 * 60_000 + 12_000), true); // joined or reloaded with 4:12 left
  assert.equal(offer(1_000), true);
  assert.equal(offer(5 * 60_000 + 1), false);   // still early in the session
  assert.equal(offer(0), false);                // the session is over
});

test("shouldOfferExtension keeps the banner while this side waits for an answer", () => {
  // The "Aguardando..." indicator lives in the banner: a reload with plenty of
  // time left must not hide a request that is still pending.
  assert.equal(shouldOfferExtension({ remainingMs: 20 * 60_000, requestPending: true }), true);
  assert.equal(shouldOfferExtension({ remainingMs: 20 * 60_000, requestPending: false }), false);
});
