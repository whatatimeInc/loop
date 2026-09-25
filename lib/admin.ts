/**
 * Who may open the internal /admin area: a signed-in user whose e-mail is
 * on the ADMIN_EMAILS list and has been confirmed. Pure, so the page, the
 * API and the tests share one rule.
 */

/** Comma-separated list → lower-cased set. Unset or blank admits nobody. */
export function parseAdminEmails(raw: string | undefined): Set<string> {
  return new Set(
    (raw ?? "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e !== ""),
  );
}

export type AdminCandidate = { email?: string | null; email_confirmed_at?: string | null } | null;

export function isAdmin(user: AdminCandidate, allowed: Set<string>): boolean {
  if (!user?.email) return false;
  // Someone could sign up with an admin's address; until that address is
  // confirmed it proves nothing about who is signed in.
  if (!user.email_confirmed_at) return false;
  return allowed.has(user.email.trim().toLowerCase());
}
