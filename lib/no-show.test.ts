import { test } from "node:test";
import assert from "node:assert/strict";
import { NO_SHOW_GRACE_MINUTES, noShowDecision, noShowOpensAt, otherParty } from "./no-show.ts";

const START = "2026-09-25T15:00:00.000Z";
const startMs = Date.parse(START);
const opens = startMs + NO_SHOW_GRACE_MINUTES * 60_000;
const base = { status: "agendada", startsAt: START, callerPersona: "mentor" as const, accused: "guest" as const };

test("the grace is 15 minutes after the start", () => {
  assert.equal(NO_SHOW_GRACE_MINUTES, 15);
  assert.equal(noShowOpensAt(START), opens);
  assert.ok(Number.isNaN(noShowOpensAt("not a date")));
});

test("otherParty flips the persona", () => {
  assert.equal(otherParty("mentor"), "guest");
  assert.equal(otherParty("guest"), "mentor");
});

test("a scheduled session accepts a no-show against the other party once the grace is over", () => {
  assert.equal(noShowDecision({ ...base, now: opens }), "ok");
  assert.equal(noShowDecision({ ...base, now: opens + 3_600_000 }), "ok");
  assert.equal(noShowDecision({ ...base, callerPersona: "guest", accused: "mentor", now: opens }), "ok");
});

test("before the grace is over it is too early", () => {
  assert.equal(noShowDecision({ ...base, now: opens - 1 }), "too-early");
  assert.equal(noShowDecision({ ...base, now: startMs }), "too-early");
});

test("an unreadable start never opens the no-show", () => {
  assert.equal(noShowDecision({ ...base, startsAt: "garbage", now: opens }), "too-early");
});

test("only a scheduled session can be marked", () => {
  for (const status of ["concluída", "cancelada", "mentor_no_show", "guest_no_show"]) {
    assert.equal(noShowDecision({ ...base, status, now: opens }), "not-scheduled", status);
  }
});

test("a participant cannot accuse themselves", () => {
  assert.equal(noShowDecision({ ...base, accused: "mentor", now: opens }), "not-counterpart");
  assert.equal(noShowDecision({ ...base, callerPersona: "guest", accused: "guest", now: opens }), "not-counterpart");
});

test("accusing yourself is reported before status and time", () => {
  assert.equal(noShowDecision({ ...base, accused: "mentor", status: "concluída", now: startMs }), "not-counterpart");
  assert.equal(noShowDecision({ ...base, status: "concluída", now: startMs }), "not-scheduled");
});
