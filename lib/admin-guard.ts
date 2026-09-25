// Server-only: resolves the signed-in user through the Supabase cookie client
// (verified with the auth server, not just read from the cookie) and applies
// the ADMIN_EMAILS rule from lib/admin.ts.
import { notFound, redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";
import { isAdmin, parseAdminEmails } from "@/lib/admin";

async function currentUser(): Promise<User | null> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  // getUser() also returns an error when there is simply no session; only an
  // unreachable auth server is a failure, and it must not read as signed out
  // (that would send a signed-in admin to the login page).
  if (error?.name === "AuthRetryableFetchError") throw new Error("Auth server unreachable");
  return user;
}

/** For the /admin page: login when signed out, 404 when signed in but not an admin. */
export async function requireAdminPage(): Promise<User> {
  const user = await currentUser();
  if (!user) redirect("/login?redirect=/admin");
  // A 404, not a 403: someone outside the list learns nothing about the area.
  if (!isAdmin(user, parseAdminEmails(env().ADMIN_EMAILS))) notFound();
  return user;
}

/** For /api/admin routes: `signed-out` → 401, `forbidden` → 404, `unavailable` → 500, otherwise the admin. */
export async function adminFromRequest(): Promise<User | "signed-out" | "forbidden" | "unavailable"> {
  let user: User | null;
  try {
    user = await currentUser();
  } catch {
    return "unavailable";
  }
  if (!user) return "signed-out";
  return isAdmin(user, parseAdminEmails(env().ADMIN_EMAILS)) ? user : "forbidden";
}
