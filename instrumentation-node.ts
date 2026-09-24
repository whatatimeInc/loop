// Node-runtime half of `instrumentation.ts`. It lives in its own module so
// that `process.exit` never appears in a file Turbopack also compiles for the
// Edge runtime: the edge bundle of `instrumentation.ts` would otherwise carry
// a "Node.js API is used which is not supported in the Edge Runtime" warning
// even though the call sits behind a runtime check.
//
// This is where the app refuses to come up on a bad configuration. It must be
// `process.exit`, not `throw`: a throw here makes Next log "Failed to prepare
// server" and then keep the process alive answering HTTP 500 on every route,
// which is the opposite of a visible failure.
//
// Sentry is initialised only after the gate passed: a process that is about
// to exit(1) over a missing key has nothing worth reporting, and the DSN it
// would use has not been validated yet.
import { formatEnvProblems, validateEnv } from "./lib/env";

export async function registerNode() {
  const result = validateEnv(process.env);
  if (!result.ok) {
    console.error(formatEnvProblems(result.problems));
    console.error("Refusing to start. See .env.example for every key and its scope.");
    process.exit(1);
  }
  await import("./sentry.server.config");
}
