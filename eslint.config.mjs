// ESLint flat config, as documented for Next.js 16 (`next lint` was removed;
// the CLI runs `eslint .` directly). core-web-vitals turns the rules that hurt
// LCP/CLS into errors; typescript adds the typescript-eslint recommended set.
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // React Compiler rules shipped as errors by eslint-plugin-react-hooks 7.
      // The existing video-call, booking and dashboard code trips them in ~24
      // places that need real refactors, not one-line edits. Reported as
      // warnings until that burn-down lands, and counted by `lint:ci` so the
      // number cannot grow. New code should not add to it.
      "react-hooks/purity": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/refs": "warn",
    },
  },
]);

export default eslintConfig;
