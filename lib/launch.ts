export type LaunchPhase = "pre" | "post";

export const LAUNCH_PHASE: LaunchPhase =
  (process.env.LAUNCH_PHASE as LaunchPhase) === "post" ? "post" : "pre";

export const isPreLaunch = LAUNCH_PHASE === "pre";
