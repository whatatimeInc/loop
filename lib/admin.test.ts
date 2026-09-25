import { test } from "node:test";
import assert from "node:assert/strict";
import { isAdmin, parseAdminEmails } from "./admin.ts";

const CONFIRMED = "2026-09-25T12:00:00Z";

test("parseAdminEmails trims, lower-cases and drops empties", () => {
  assert.deepEqual([...parseAdminEmails(" Ops@Loop.io, ,dev@loop.io,")].sort(), ["dev@loop.io", "ops@loop.io"]);
});

test("an unset or blank list admits nobody", () => {
  assert.equal(parseAdminEmails(undefined).size, 0);
  assert.equal(parseAdminEmails("   ").size, 0);
  assert.equal(isAdmin({ email: "ops@loop.io", email_confirmed_at: CONFIRMED }, parseAdminEmails(undefined)), false);
});

test("a confirmed e-mail on the list is admin, whatever the letter case", () => {
  const allowed = parseAdminEmails("ops@loop.io");
  assert.equal(isAdmin({ email: "OPS@loop.io", email_confirmed_at: CONFIRMED }, allowed), true);
});

test("an e-mail off the list is not admin", () => {
  assert.equal(isAdmin({ email: "guest@loop.io", email_confirmed_at: CONFIRMED }, parseAdminEmails("ops@loop.io")), false);
});

test("an unconfirmed e-mail is not admin even when listed", () => {
  const allowed = parseAdminEmails("ops@loop.io");
  assert.equal(isAdmin({ email: "ops@loop.io", email_confirmed_at: null }, allowed), false);
  assert.equal(isAdmin({ email: "ops@loop.io" }, allowed), false);
});

test("no user or no e-mail is not admin", () => {
  const allowed = parseAdminEmails("ops@loop.io");
  assert.equal(isAdmin(null, allowed), false);
  assert.equal(isAdmin({ email: null, email_confirmed_at: CONFIRMED }, allowed), false);
  assert.equal(isAdmin({ email: "", email_confirmed_at: CONFIRMED }, allowed), false);
});
