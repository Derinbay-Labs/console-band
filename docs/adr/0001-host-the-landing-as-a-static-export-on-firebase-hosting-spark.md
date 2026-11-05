---
status: proposed
date: 2026-11-06
deciders: architect
consulted: team lead
informed: team lead, CEO
supersedes:
superseded-by:
---

# 0001 — Host the landing as a static export on Firebase Hosting Spark

## Context and problem statement

console-band needs a public TR/EN landing at `https://console-band.derinbay.com/`
before it is listed on `derinbay.com/<locale>/labs/` (#1, company#538). The
company default is a Next.js static export on Firebase Hosting (Spark) with a
preview → smoke → promote deploy, copied from netpano (`landing-page` skill,
`references/stack-and-deploy.md`). console-band differs from netpano in four
ways that this record has to settle: the repository is **public**, its trunk
is `main`, it has no GCP project and no CI yet, and the repository root is
the Claude Code plugin itself (`.claude-plugin/marketplace.json` has
`"source": "./"`), so every file committed here is copied into each user's
plugin install. DNS for `derinbay.com` is on Cloudflare; the existing
Firebase subdomain `netpano.derinbay.com` is a DNS-only CNAME to
`netpano-derinbay.web.app`.

## Decision drivers

- Company default: static export, Firebase Hosting Spark, keyless WIF,
  preview → smoke → promote, live never a separate build.
- $0 spend: no paid service, no Blaze upgrade.
- Public repository: workflow logs are public and anyone can open a fork PR,
  so no deploy credential may be reachable from untrusted code.
- No third-party analytics, cookies, fonts or scripts.
- The CEO's DNS step is the launch switch and must be exact.

## Considered options

1. **Static export in `web/`, own Firebase project, GitHub-hosted runners** —
   company stack, isolated quota, ephemeral runners for a public repo.
2. **Same, on the company's self-hosted runners** — follows the handbook §3
   runner rule literally.
3. **Add a site to an existing Firebase project** (for example
   `derinbay-com`) — no new project, shared quota and IAM.
4. **GitHub Pages from this repo** — no GCP at all.

## Decision outcome

Chosen: **option 1**, because it is the company landing stack unchanged
except where the public repository makes the default unsafe.

### Layout and build

- Directory: `web/` (the skill default; console-band has no signed-in app).
  Next.js static export with `output: 'export'` and `trailingSlash: true`;
  `npm run build` writes `web/out/`. `web/node_modules/`, `web/.next/` and
  `web/out/` are git-ignored. Lockfile `web/package-lock.json` is committed.
- Locales `/en/` and `/tr/`, each a complete page; `/` chooses a locale
  without cookies (EN default, `x-default` → `/en/`); the SEO spec owns
  the exact map.
- Fonts are self-hosted files in `web/`; no external request of any kind.
  No API, no server runtime.

### Hosting

- New Firebase project on the Spark plan, preferred id
  `console-band-derinbay` (Firebase may suffix it; the real id lives in the
  repository variable `GCP_PROJECT_ID`).
- Hosting site id: **`console-band-derinbay`**
  (`console-band-derinbay.web.app`). If the project id was suffixed, create
  this site explicitly; the site id is the stable contract.
- Root `firebase.json`: `"site": "console-band-derinbay"`,
  `"public": "web/out"`, `cleanUrls` and `trailingSlash` on, and netpano's
  headers: CSP `default-src 'self'` (no `connect-src` beyond `'self'`), HSTS,
  `nosniff`, `strict-origin-when-cross-origin`, `frame-ancestors 'none'`,
  and `Cache-Control: public, max-age=31536000, immutable` on
  `/_next/static/**`. Release retention: keep the last 10 live releases.
- Custom domain `console-band.derinbay.com`, added to the site in the
  Firebase console; records are the CEO step in #3.

### CI and deploy

- `.github/workflows/web.yml` ("Web"): on `pull_request` and on `push` to
  `main` for `web/**`, `firebase.json` and the two workflow files; one
  `npm ci`, lint, build, assert `out/en/index.html` and `out/tr/index.html`.
  It never uses `pull_request_target`, secrets or `id-token`.
- `.github/workflows/deploy-web.yml`: netpano's shape with these values.
  1. Trigger: `workflow_run` of "Web" on `main`, plus `workflow_dispatch`.
     The job runs only when the event is `workflow_dispatch`, or when the
     run concluded `success`, its event is `push`, and
     `workflow_run.head_repository.full_name == github.repository` (a fork
     branch named `main` must not deploy). `concurrency: deploy-web`.
  2. Auth: keyless WIF. Repository **variables** (not secrets; none needed)
     `GCP_PROJECT_ID`, `GCP_WIF_PROVIDER`, `GCP_DEPLOY_SA`. The WIF provider's
     attribute condition is
     `assertion.repository == 'Derinbay-Labs/console-band' &&
     assertion.ref == 'refs/heads/main'`. The deploy service account holds
     only `roles/firebasehosting.admin` and
     `roles/serviceusage.serviceUsageConsumer` (firebase-tools needs
     `serviceusage.services.use` to call the Hosting API) on the project.
  3. Build the export at the run's head SHA and assert both locale files.
  4. Publish to preview channel `preview` (`--expires 7d`) and smoke
     `/en/`, `/tr/`, `/robots.txt` and `/sitemap.xml` for HTTP 200
     (six tries, 10 s apart).
  5. Promote that exact version:
     `hosting:clone console-band-derinbay:preview console-band-derinbay:live`.
  6. Smoke the same paths on `https://console-band-derinbay.web.app/`, and
     on `https://$LIVE_DOMAIN/` when the repository variable `LIVE_DOMAIN`
     is set. devops sets `LIVE_DOMAIN=console-band.derinbay.com` once the
     Firebase console shows the domain **Connected**; before the CEO DNS
     step the custom domain does not resolve, so an unconditional smoke
     would fail every pre-launch deploy.
- Runners: **GitHub-hosted `ubuntu-24.04`** for both workflows. This
  deviates from handbook §3 (self-hosted only, company#127). Reason:
  GitHub advises against self-hosted runners on public repositories, since
  a fork PR can run arbitrary code on the persistent build machine that
  also runs private-repo jobs; GitHub-hosted runners are free for public
  repositories, so the cost reason behind the rule does not apply. This
  needs a CEO decision (see Consequences).
- Repository setting: Actions fork-PR workflows require approval for all
  external contributors.
- Pins: `firebase-tools` 15.35.0, Node 26.13.0, actions pinned by SHA as
  in netpano; Renovate keeps them current.

### Rollback

1. Immediate: Firebase console → Hosting → `console-band-derinbay` →
   Release history → previous release → **Roll back**; or
   `firebase hosting:clone console-band-derinbay:@<VERSION_ID>
   console-band-derinbay:live`.
2. Durable: revert the PR on `main`; "Web" then redeploys the reverted
   tree through the normal pipeline.
3. Take the landing offline: the CEO deletes the `console-band` DNS record;
   the `.web.app` URL keeps serving.

### Consequences

#### Good

- Same stack, headers and deploy shape as netpano; the frontend owner and
  devops reuse it.
- No deploy secret exists; a public log or a fork PR cannot deploy, because
  WIF only trusts `main` of this repository.
- An own project gives the landing its own Spark quota and IAM.

#### Bad / cost

- Spark serves 10 GB a month; over that, Firebase disables the site until
  the next month. At about 300 KB per first visit that is roughly 30 000
  visits a month; keep the page light. A Blaze upgrade is a CEO spend
  decision.
- `web/` source (including fonts and images) ships inside every plugin
  install, because the plugin source is the repository root. Keep assets
  small; moving the plugin to a subdirectory would need its own ADR.
- **CEO decision needed:** GitHub-hosted runners for this public repository
  versus the self-hosted-only rule. Recommended default: GitHub-hosted.
  If declined: self-hosted with a runner group limited to console-band and
  mandatory fork-PR approval, accepting the residual risk.
- One more GCP project and WIF pool to maintain.

#### Neutral

- The `.web.app` URL is public before launch; canonical and hreflang tags
  point to `console-band.derinbay.com`.
- The CEO DNS step, not the deploy, is the launch switch.

### Confirmation

- Review of #4 checks `firebase.json` (site id, `public`, headers) and both
  workflows (trigger guard, variables only, runner label, promote by
  `hosting:clone`) against this record.
- The deploy run's preview and live smokes are the runtime check; QA
  verifies `https://console-band.derinbay.com/` after the DNS step.
- `curl -sI https://console-band.derinbay.com/en/` shows the CSP and HSTS
  headers and no `Set-Cookie`.

## Pros and cons of the options

### Option 1 — own project, GitHub-hosted runners

- Good, because ephemeral runners keep untrusted fork code off company
  machines, and the minutes are free for a public repository.
- Bad, because it deviates from the handbook §3 runner rule.

### Option 2 — self-hosted runners

- Good, because it follows the runner rule and the existing templates.
- Bad, because the runner group must allow a public repository; one
  mistaken fork-PR approval runs foreign code on the build machine.

### Option 3 — site in an existing Firebase project

- Good, because no new project or WIF pool.
- Bad, because it shares one Spark quota and one deployer identity across
  products, and the `derinbay-com` deployer would gain a second site.

### Option 4 — GitHub Pages

- Good, because no GCP project at all.
- Bad, because it leaves the company stack: no preview channels, no
  custom security headers (CSP, HSTS), and a different DNS shape.

## More information

Versions looked up on 2026-11-06 (constitution §4): `firebase-tools 15.35.0`
and `next 16.4.5` (npm registry), Node `v26.13.0` LTS (nodejs.org dist
index). Site id `console-band-derinbay.web.app` returned "Site Not Found"
on 2026-11-06 (unclaimed).

Links: #1 (landing slice), #3 (this decision and the CEO DNS step), #4
(implementation), company `landing-page` skill, netpano `firebase.json` and
`.github/workflows/deploy-web.yml`,
<https://firebase.google.com/docs/hosting/custom-domain>,
<https://firebase.google.com/docs/hosting/usage-quotas-pricing>,
<https://firebase.google.com/docs/hosting/manage-hosting-resources>.
