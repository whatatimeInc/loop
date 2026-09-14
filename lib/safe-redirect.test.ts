import { test } from "node:test";
import assert from "node:assert/strict";
import { safeRedirectPath } from "./safe-redirect.ts";

const F = "/explorar";

test("keeps same-origin paths, including query and hash", () => {
  assert.equal(safeRedirectPath("/conta"), "/conta");
  assert.equal(safeRedirectPath("/sala/abc?x=1#y"), "/sala/abc?x=1#y");
  assert.equal(safeRedirectPath("/agendar/joao", "/criar"), "/agendar/joao");
  assert.equal(safeRedirectPath("  /sala/abc "), "/sala/abc");
});

test("falls back when the value is missing", () => {
  assert.equal(safeRedirectPath(null), F);
  assert.equal(safeRedirectPath(undefined), F);
  assert.equal(safeRedirectPath(""), F);
  assert.equal(safeRedirectPath(null, "/criar"), "/criar");
});

test("rejects everything that would leave the site", () => {
  for (const v of [
    "//evil.com",
    "//evil.com/conta",
    "/\\evil.com",
    "\\\\evil.com",
    "https://evil.com",
    "http://evil.com/x",
    "javascript:alert(1)",
    "evil.com",
    "conta",
    " //evil.com",
    "\t/\\evil.com",
  ]) {
    assert.equal(safeRedirectPath(v), F, `expected fallback for ${JSON.stringify(v)}`);
  }
});

test("resolves dot segments and keeps encoded slashes as path text", () => {
  assert.equal(safeRedirectPath("/conta/../agenda"), "/agenda");
  assert.equal(safeRedirectPath("/%2F%2Fevil.com"), "/%2F%2Fevil.com");
});
