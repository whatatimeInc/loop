import { test } from "node:test";
import assert from "node:assert/strict";
import {
  cancelDeadline,
  cancelDeadlineHours,
  cancelState,
  DEFAULT_CANCEL_DEADLINE_HOURS,
} from "./cancel-window.ts";

const T0 = Date.parse("2026-09-25T15:00:00Z");
const HOUR = 3_600_000;

test("the deadline sits the configured number of hours before the start", () => {
  assert.equal(cancelDeadline(new Date(T0), 24), T0 - 24 * HOUR);
  assert.equal(cancelDeadline("2026-09-25T15:00:00Z", 2), T0 - 2 * HOUR);
});

test("a scheduled session may be cancelled up to the deadline, inclusive", () => {
  const s = { status: "agendada", startsAt: new Date(T0).toISOString() };
  assert.equal(cancelState(s, T0 - 25 * HOUR, 24), "cancellable");
  assert.equal(cancelState(s, T0 - 24 * HOUR, 24), "cancellable");
});

test("after the deadline the cancellation is refused", () => {
  const s = { status: "agendada", startsAt: new Date(T0).toISOString() };
  assert.equal(cancelState(s, T0 - 24 * HOUR + 1, 24), "past-deadline");
  assert.equal(cancelState(s, T0 - 1, 24), "past-deadline");
  assert.equal(cancelState(s, T0 + HOUR, 24), "past-deadline");
});

test("only a scheduled session can be cancelled", () => {
  for (const status of ["cancelada", "concluída", "mentor_no_show", "guest_no_show"]) {
    assert.equal(cancelState({ status, startsAt: new Date(T0).toISOString() }, T0 - 48 * HOUR, 24), "not-scheduled");
  }
});

test("an unreadable start fails closed", () => {
  assert.equal(cancelState({ status: "agendada", startsAt: "not a date" }, T0 - 48 * HOUR, 24), "past-deadline");
});

test("cancelDeadlineHours reads the env override and falls back on garbage", () => {
  assert.equal(DEFAULT_CANCEL_DEADLINE_HOURS, 24);
  assert.equal(cancelDeadlineHours({}), 24);
  assert.equal(cancelDeadlineHours({ CANCEL_DEADLINE_HOURS: "2" }), 2);
  assert.equal(cancelDeadlineHours({ CANCEL_DEADLINE_HOURS: "0.5" }), 0.5);
  assert.equal(cancelDeadlineHours({ CANCEL_DEADLINE_HOURS: "abc" }), 24);
  assert.equal(cancelDeadlineHours({ CANCEL_DEADLINE_HOURS: "-5" }), 24);
  assert.equal(cancelDeadlineHours({ CANCEL_DEADLINE_HOURS: "0" }), 0);
  assert.equal(cancelDeadlineHours({ CANCEL_DEADLINE_HOURS: "" }), 24);
  assert.equal(cancelDeadlineHours({ CANCEL_DEADLINE_HOURS: "   " }), 24);
});
