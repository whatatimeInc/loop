import { test } from "node:test";
import assert from "node:assert/strict";
import {
  acceptedMinutes,
  effectiveDuration,
  extendedWindow,
  extensionAllowance,
  MAX_EXTENSION_MINUTES,
  requestOutcome,
  respondPermission,
  roomExpiryFor,
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
