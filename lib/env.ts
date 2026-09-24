// Server-side only — never import from client components (pulls in zod and
// names server secrets). The browser Supabase client and lib/launch.ts keep
// their own static process.env reads so Next can inline the public values.
//
// Single source of truth for the configuration the app needs. instrumentation.ts
// runs validateEnv() once at server start and refuses to come up when a key is
// missing; server code reads values through env() and never touches
// process.env.X directly, so a typo in a key name is a startup failure, not a
// silent `undefined` at 3 a.m.
import { z } from "zod";
import { decodeWebhookSecret } from "./webhook-secret.ts";

/** Keys that must be present and non-blank for the server to start. */
export const REQUIRED_ENV_KEYS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_SITE_URL",
  "SUPABASE_SECRET_KEY",
  "DAILY_CO_API_KEY",
  "DAILY_WEBHOOK_SECRET",
  "LAUNCH_PHASE",
] as const;

/**
 * Optional pair. The basic-auth gate is for staging only and is deliberately
 * absent in production; a half-set pair is an error because proxy.ts would
 * silently disable the gate.
 */
export const OPTIONAL_ENV_KEYS = ["BASIC_AUTH_USER", "BASIC_AUTH_PASS", "NEXT_PUBLIC_SENTRY_DSN"] as const;

export type EnvSource = Record<string, string | undefined>;

/** A blank or whitespace-only value (an emptied Vercel field) means "unset". */
function blankToUndefined(value: unknown): unknown {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

const required = () => z.preprocess(blankToUndefined, z.string());
const optional = () => z.preprocess(blankToUndefined, z.string().optional());
// The value handed to Daily at webhook registration; Daily keys its HMAC with
// the decoded bytes, so a non-base64 string would verify nothing.
const webhookSecret = () =>
  z.preprocess(
    blankToUndefined,
    z.string().refine((value) => decodeWebhookSecret(value) !== null, {
      message: "must be base64 of at least 16 bytes, e.g. `openssl rand -base64 32`",
    })
  );

const schema = z
  .object({
    NEXT_PUBLIC_SUPABASE_URL: z.preprocess(blankToUndefined, z.url()),
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: required(),
    NEXT_PUBLIC_SITE_URL: z.preprocess(blankToUndefined, z.url()),
    SUPABASE_SECRET_KEY: required(),
    DAILY_CO_API_KEY: required(),
    DAILY_WEBHOOK_SECRET: webhookSecret(),
    LAUNCH_PHASE: z.preprocess(blankToUndefined, z.enum(["pre", "post"])),
    BASIC_AUTH_USER: optional(),
    BASIC_AUTH_PASS: optional(),
    // Error reporting is opt-in: without a DSN the Sentry SDK initialises
    // disabled and every capture is a no-op.
    NEXT_PUBLIC_SENTRY_DSN: z.preprocess(blankToUndefined, z.url().optional()),
  })
  .superRefine((value, ctx) => {
    if (value.BASIC_AUTH_USER !== undefined && value.BASIC_AUTH_PASS === undefined) {
      ctx.addIssue({
        code: "custom",
        path: ["BASIC_AUTH_PASS"],
        message: "required because BASIC_AUTH_USER is set",
      });
    }
    if (value.BASIC_AUTH_PASS !== undefined && value.BASIC_AUTH_USER === undefined) {
      ctx.addIssue({
        code: "custom",
        path: ["BASIC_AUTH_USER"],
        message: "required because BASIC_AUTH_PASS is set",
      });
    }
  });

export type Env = z.infer<typeof schema>;

export type EnvProblem = {
  key: string;
  /** `missing`: unset or blank. `invalid`: present but not in the expected shape. */
  reason: "missing" | "invalid";
  /** Human sentence for the operator. Never contains the offending value. */
  message: string;
};

export type EnvResult = { ok: true; env: Env } | { ok: false; problems: EnvProblem[] };

function describe(issue: z.core.$ZodIssue, unset: boolean): Omit<EnvProblem, "key"> {
  // Whatever the check (string, url, enum), an unset or blank key is "missing";
  // zod reports it under a different code per check, so decide from the source.
  if (unset) {
    return { reason: "missing", message: issue.code === "custom" ? issue.message : "not set" };
  }
  if (issue.code === "invalid_format" && issue.format === "url") {
    return { reason: "invalid", message: "must be an absolute URL, e.g. https://example.com" };
  }
  if (issue.code === "invalid_value") {
    return { reason: "invalid", message: `must be one of: ${issue.values.map(String).join(", ")}` };
  }
  return { reason: "invalid", message: issue.message };
}

/**
 * Validate a configuration record. Pure: pass `process.env` at startup or a
 * literal in tests. Reports every problem at once, one per key, sorted by key,
 * so the operator fixes the deployment in one round trip.
 */
export function validateEnv(source: EnvSource): EnvResult {
  const parsed = schema.safeParse(source);
  if (parsed.success) return { ok: true, env: parsed.data };
  const byKey = new Map<string, EnvProblem>();
  for (const issue of parsed.error.issues) {
    const key = String(issue.path[0] ?? "");
    if (!key || byKey.has(key)) continue;
    const unset = blankToUndefined(source[key]) === undefined;
    byKey.set(key, { key, ...describe(issue, unset) });
  }
  const problems = [...byKey.values()].sort((a, b) => a.key.localeCompare(b.key));
  return { ok: false, problems };
}

/** The text the operator reads on a refused start: a fixed first line, then one line per key. */
export function formatEnvProblems(problems: EnvProblem[]): string {
  return ["Missing or invalid configuration:", ...problems.map((p) => `  - ${p.key}: ${p.message}`)].join("\n");
}

let cached: Env | undefined;

/**
 * The validated configuration, read once from process.env and cached.
 * Throws with the same message instrumentation.ts prints, so a server that
 * somehow skipped startup validation still fails loudly at first use instead
 * of sending `Bearer undefined` to Daily.
 *
 * Static `process.env.X` reads on purpose: Next only inlines NEXT_PUBLIC_*
 * values for literal member access, never for `process.env[name]`.
 */
export function env(): Env {
  if (cached) return cached;
  const result = validateEnv({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
    DAILY_CO_API_KEY: process.env.DAILY_CO_API_KEY,
    DAILY_WEBHOOK_SECRET: process.env.DAILY_WEBHOOK_SECRET,
    LAUNCH_PHASE: process.env.LAUNCH_PHASE,
    BASIC_AUTH_USER: process.env.BASIC_AUTH_USER,
    BASIC_AUTH_PASS: process.env.BASIC_AUTH_PASS,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  });
  if (!result.ok) throw new Error(formatEnvProblems(result.problems));
  cached = result.env;
  return cached;
}
