// ESLint flat config. `eslint-config-next` ships a flat-config array and
// already wires @next/next, react, react-hooks, import and jsx-a11y; we layer
// the full jsx-a11y recommended set on top (constitution §5, accessibility),
// and turn off everything
// Prettier owns.
//
// Pinned to ESLint 9 on purpose — see docs/versions.md. `eslint-plugin-react`
// and `eslint-plugin-import`, which eslint-config-next depends on, still call
// APIs that ESLint 10 removed.
import js from "@eslint/js";
import next from "eslint-config-next";
import prettier from "eslint-config-prettier/flat";
import jsxA11y from "eslint-plugin-jsx-a11y";
import globals from "globals";

const config = [
  {
    ignores: [
      ".next/**",

      "coverage/**",
      "next-env.d.ts",
      "node_modules/**",
      "playwright-report/**",
      "test-results/**",
      "out/**",
    ],
  },
  js.configs.recommended,
  ...next,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      // `eslint-config-next` registers the jsx-a11y plugin but enables only a
      // handful of its rules; take the whole recommended set. Spreading the
      // plugin's own config block instead would re-register the plugin, which
      // ESLint rejects.
      ...jsxA11y.flatConfigs.recommended.rules,
    },
  },
  {
    // TypeScript itself reports undefined identifiers and unused bindings, and
    // it knows about DOM/Node globals the core rules do not.
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "no-undef": "off",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
      ],
    },
  },
  {
    files: ["**/*.test.ts", "**/*.test.tsx", "e2e/**/*.ts"],
    rules: {
      "@typescript-eslint/no-non-null-assertion": "off",
    },
  },
  prettier,
];

export default config;
