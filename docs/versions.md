# Version pins

Constitution §4 wants the newest stable of every dependency. These two web dependencies are
deliberately older (introduced in PR #10). The reason and removal condition are also recorded in
`web/package.json` under `pinnedBelowLatest`; keep the two in sync.

| Dependency | Pinned | Latest at 2026-11-06 | Why | Remove when |
|---|---|---|---|---|
| `typescript` | 6.0.3 | 7.0.2 | `typescript-eslint` peers on `typescript <6.1.0`, so `eslint-config-next` cannot load under TS 7 and `npm run lint` fails. Tracking: <https://github.com/typescript-eslint/typescript-eslint/issues/10940>. | `typescript-eslint` ships TS 7 support; bump `typescript` and `typescript-eslint` in one commit and re-run lint, typecheck, test, build, e2e. |
| `eslint` | 9.39.5 | 10.14.0 | `eslint-config-next` depends on `eslint-plugin-react` and `eslint-plugin-import`, whose newest releases still call APIs ESLint 10 removed. Tracking: <https://github.com/jsx-eslint/eslint-plugin-react/issues>. | `eslint-plugin-react` and `eslint-plugin-import` both support ESLint 10; bump `eslint` and `@eslint/js` in one commit and re-run the full chain. |
