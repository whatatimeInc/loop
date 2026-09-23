// Next.js instrumentation hook: `register` runs once when a server instance
// starts (not during `next build`), before the first request is served.
//
// This is where the app refuses to come up on a bad configuration. It must be
// `process.exit`, not `throw`: a throw here makes Next log "Failed to prepare
// server" and then keep the process alive answering HTTP 500 on every route,
// which is the opposite of a visible failure. The Node runtime check keeps the
// edge bundle free of zod and of server secret names.
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { validateEnv, formatEnvProblems } = await import("./lib/env");
  const result = validateEnv(process.env);
  if (result.ok) return;
  console.error(formatEnvProblems(result.problems));
  console.error("Refusing to start. See .env.example for every key and its scope.");
  process.exit(1);
}
