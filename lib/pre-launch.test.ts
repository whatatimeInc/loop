import { test } from "node:test";
import assert from "node:assert/strict";
import { isPreLaunchPublicPath } from "./pre-launch.ts";

test("the home page is public before launch", () => {
  assert.equal(isPreLaunchPublicPath("/"), true);
});

test("the waitlist landing and everything under it are public", () => {
  assert.equal(isPreLaunchPublicPath("/waitlist"), true);
  assert.equal(isPreLaunchPublicPath("/waitlist/api/signup"), true);
  assert.equal(isPreLaunchPublicPath("/waitlist/access"), true);
});

test("the health check is public so monitors work before the launch flag flips", () => {
  assert.equal(isPreLaunchPublicPath("/api/health"), true);
});

test("only the exact health path is public, not lookalikes or children", () => {
  assert.equal(isPreLaunchPublicPath("/api/healthz"), false);
  assert.equal(isPreLaunchPublicPath("/api/health/db"), false);
  assert.equal(isPreLaunchPublicPath("/api/health-check"), false);
});

test("every other page and API path is still redirected", () => {
  for (const p of ["/explorar", "/dashboard", "/api/sessions", "/api/webhooks/daily", "/login"]) {
    assert.equal(isPreLaunchPublicPath(p), false, p);
  }
});
