import { test } from "node:test";
import assert from "node:assert/strict";
import { earlyEntryMinutes, entryState, entryWindow, LATE_EXIT_MINUTES, TOKEN_GRACE_MINUTES } from "./sala-window.ts";

const T0 = Date.parse("2026-09-14T15:00:00Z");
const MIN = 60_000;

test("window opens early-entry minutes before start and closes late-exit minutes after the end", () => {
  const w = entryWindow(new Date(T0), 30, 10);
  assert.equal(w.opensAt, T0 - 10 * MIN);
  assert.equal(w.endsAt, T0 + 30 * MIN);
  assert.equal(w.closesAt, T0 + 30 * MIN + LATE_EXIT_MINUTES * MIN);
  assert.equal(w.tokenExpiresAt, w.closesAt + TOKEN_GRACE_MINUTES * MIN);
});

test("an unreadable start or duration fails closed", () => {
  assert.equal(entryState(entryWindow("not a date", 30, 10), T0), "expired");
  assert.equal(entryState(entryWindow(new Date(T0), Number.NaN, 10), T0), "expired");
});

test("entryState classifies the three moments", () => {
  const w = entryWindow(new Date(T0), 30, 10);
  assert.equal(entryState(w, T0 - 11 * MIN), "too-early");
  assert.equal(entryState(w, T0 - 10 * MIN), "open");
  assert.equal(entryState(w, T0 + 5 * MIN), "open");
  assert.equal(entryState(w, w.closesAt), "open");
  assert.equal(entryState(w, w.closesAt + 1), "expired");
});

test("earlyEntryMinutes reads the env override and falls back on garbage", () => {
  assert.equal(earlyEntryMinutes({}), 10);
  assert.equal(earlyEntryMinutes({ SALA_EARLY_ENTRY_MINUTES: "1440" }), 1440);
  assert.equal(earlyEntryMinutes({ SALA_EARLY_ENTRY_MINUTES: "abc" }), 10);
  assert.equal(earlyEntryMinutes({ SALA_EARLY_ENTRY_MINUTES: "0" }), 10);
  assert.equal(earlyEntryMinutes({ SALA_EARLY_ENTRY_MINUTES: "-5" }), 10);
});
