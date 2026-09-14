/**
 * Resolve an untrusted `redirect` parameter (from a magic-link email, an OAuth
 * callback, or the login/signup forms) to a same-origin path.
 *
 * Anything that would leave the site is replaced by `fallback`: absolute URLs,
 * protocol-relative `//host`, the `/\host` spelling browsers treat the same way,
 * and non-http schemes such as `javascript:`. The value is parsed with the URL
 * constructor against a fixed origin, so encoded and dot-segment tricks resolve
 * before the check instead of after it.
 */
const CHECK_ORIGIN = "https://redirect.invalid";

export function safeRedirectPath(value: string | null | undefined, fallback = "/explorar"): string {
  value = value?.trim();
  if (!value) return fallback;
  // Must be a rooted path. Browsers read "\" as "/" in URLs, so "/\evil.com"
  // is the same protocol-relative "//evil.com" and is rejected too.
  if (value[0] !== "/" || value[1] === "/" || value[1] === "\\") return fallback;
  let url: URL;
  try {
    url = new URL(value, CHECK_ORIGIN);
  } catch {
    return fallback;
  }
  if (url.origin !== CHECK_ORIGIN) return fallback;
  return `${url.pathname}${url.search}${url.hash}`;
}
