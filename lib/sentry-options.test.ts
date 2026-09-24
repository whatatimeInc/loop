import { test } from "node:test";
import assert from "node:assert/strict";
import { sentryDsn } from "./sentry-options.ts";

test("a pasted DSN with surrounding whitespace is trimmed before the SDK sees it", () => {
  assert.equal(sentryDsn(" https://k@o1.ingest.sentry.io/42\n"), "https://k@o1.ingest.sentry.io/42");
});

test("unset and blank DSNs both mean disabled", () => {
  assert.equal(sentryDsn(undefined), undefined);
  assert.equal(sentryDsn(""), undefined);
  assert.equal(sentryDsn("   "), undefined);
});
