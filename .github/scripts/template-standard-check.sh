#!/usr/bin/env bash
# Asserts that a directory of workflow files keeps the company CI standard
# (company#354, #366/#367/#370). Defaults to templates/.github/workflows, where
# CI runs it with --require-all; a product repo can run it on its own
# .github/workflows (files it does not have are skipped).
#
#   template-standard-check.sh [--require-all] [workflows-dir]
#
# Plain grep/awk on comment-stripped files, so it runs on every runner. Each
# rule prints "ok" or "FAIL <file>: <why>"; any FAIL exits 1.
set -u
require_all=0
if [ "${1:-}" = "--require-all" ]; then require_all=1; shift; fi
dir="${1:-templates/.github/workflows}"
tmp="$(mktemp -d)"; trap 'rm -rf "$tmp"' EXIT
fail=0

bad() { echo "FAIL  $1: $2"; fail=1; }
good() { echo "ok    $1: $2"; }

# code <name>: comment-stripped copy of $dir/<name>.yml in $tmp; false if absent.
code() {
  local src="$dir/$1.yml"
  if [ ! -f "$src" ]; then
    if [ "$require_all" = 1 ]; then bad "$1.yml" "missing"; else echo "skip  $1.yml: not present"; fi
    return 1
  fi
  grep -vE '^[[:space:]]*#' "$src" > "$tmp/$1.yml"
}
# job <name> <job-id>: the job's block (2-space-indented key to the next one).
job() {
  awk -v j="$2" '
    /^  [A-Za-z0-9_-]+:/ { on = ($1 == j ":") }
    /^[a-z]/ && !/^jobs:/ { on = 0 }
    on' "$tmp/$1.yml"
}
# trig <name>: the top-level event names under `on:`, one per line.
trig() {
  awk '
    /^on:/ { on = 1; next }
    /^[A-Za-z]/ { on = 0 }
    on && /^  [A-Za-z_]+:/ { sub(/:.*/, "", $1); print $1 }' "$tmp/$1.yml"
}
# step <name> <pattern>: the step block (from its "- " line to the next) that mentions the pattern.
step() {
  awk -v p="$2" '
    /^      - / { if (hit) print blk; blk = ""; hit = 0 }
    { blk = blk $0 "\n"; if ($0 ~ p) hit = 1 }
    END { if (hit) printf "%s", blk }' "$tmp/$1.yml"
}
has() { grep -qE -- "$2" "$tmp/$1.yml"; }

# 1. Identical-tree skip on push for web/backend/android/ios (#350/#366).
for f in web backend android ios; do
  code "$f" || continue
  t="$(job "$f" tree)"
  if [ -z "$t" ] || ! printf '%s\n' "$t" | grep -qE "github.event_name == 'push'" \
     || ! printf '%s\n' "$t" | grep -qE 'uses: \./\.github/workflows/tree-check\.yml'; then
    bad "$f.yml" "needs a push-only 'tree' job calling ./.github/workflows/tree-check.yml"
  elif ! has "$f" 'needs: *(tree|\[[^]]*tree[^]]*\])' || ! has "$f" "needs\.tree\.outputs\.identical != 'true'"; then
    bad "$f.yml" "test jobs must need 'tree' and gate on needs.tree.outputs.identical != 'true'"
  elif ! has "$f" "\.github/workflows/tree-check\.yml'" || ! has "$f" "\.github/scripts/identical-tree"; then
    bad "$f.yml" "path filters must list tree-check.yml and the identical-tree scripts"
  else
    good "$f.yml" "identical-tree gate"
  fi
done

# 2. Secret scan: pull_request + schedule (+ dispatch); never push.
if code secret-scan; then
  ev="$(trig secret-scan | sort | tr '\n' ' ')"
  case "$ev" in
    "pull_request schedule workflow_dispatch "|"pull_request schedule ") good secret-scan.yml "triggers: $ev" ;;
    *) bad secret-scan.yml "triggers must be pull_request + schedule (+ workflow_dispatch), got: $ev" ;;
  esac
fi

# 3. Dependency audit: cron + dispatch only, central osv-config action.
if code dependency-audit; then
  ev="$(trig dependency-audit | sort | tr '\n' ' ')"
  if [ "$ev" != "schedule workflow_dispatch " ]; then
    bad dependency-audit.yml "triggers must be schedule + workflow_dispatch only, got: $ev"
  elif ! has dependency-audit 'self-hosted'; then
    # A public repo runs GitHub-hosted and cannot call the private osv-config
    # action (company#750), so it carries its own scanner config.
    good dependency-audit.yml "cron + dispatch only, GitHub-hosted (public repo)"
  elif ! has dependency-audit 'uses: *Derinbay-Labs/company/templates/\.github/scripts/osv-config@'; then
    bad dependency-audit.yml "must use the central osv-config action"
  else
    good dependency-audit.yml "cron + dispatch only, central osv-config"
  fi
fi

# 4. Web: one npm ci, e2e is a step not a job.
if code web; then
  n="$(grep -cE '(^|[^-])npm ci' "$tmp/web.yml")"
  if [ "$n" != 1 ]; then
    bad web.yml "exactly one 'npm ci' expected, found $n"
  elif grep -qE '^  [A-Za-z0-9_-]*e2e[A-Za-z0-9_-]*:' "$tmp/web.yml"; then
    bad web.yml "e2e must be a step of the web job, not a separate job"
  elif ! has web 'npm run test:e2e'; then
    bad web.yml "the e2e step is missing"
  else
    good web.yml "one npm ci, no separate e2e job"
  fi
fi

# 5. Deploy: workflow_run, no cancelled deploys, a failed download fails the deploy.
if code deploy; then
  if ! trig deploy | grep -qx workflow_run; then
    bad deploy.yml "must trigger on workflow_run"
  elif ! has deploy 'cancel-in-progress: *false'; then
    bad deploy.yml "concurrency must set cancel-in-progress: false"
  elif [ -z "$(step deploy 'actions/download-artifact@')" ]; then
    bad deploy.yml "the artifact download step is missing"
  elif step deploy 'actions/download-artifact@' | grep -q 'continue-on-error'; then
    bad deploy.yml "artifact download must not use continue-on-error"
  else
    good deploy.yml "workflow_run, cancel-in-progress false, strict download"
  fi
fi

# 6. Android: no release build on a PR, instrumented job dispatch-only.
if code android; then
  rel=""
  for j in $(grep -oE '^  [A-Za-z0-9_-]+:' "$tmp/android.yml" | tr -d ' :'); do
    b="$(job android "$j")"
    if printf '%s\n' "$b" | grep -qE 'assembleRelease|bundleRelease'; then
      printf '%s\n' "$b" | grep -qE "github\.event_name (!= 'pull_request'|== '(push|workflow_dispatch)')" || rel="$rel $j"
    fi
  done
  instr="$(job android instrumented)"
  if [ -n "$rel" ]; then
    bad android.yml "release build in job(s)$rel is not kept off pull_request"
  elif [ -z "$instr" ] || ! printf '%s\n' "$instr" | grep -qE "^    if: github\.event_name == 'workflow_dispatch'[[:space:]]*$"; then
    bad android.yml "'instrumented' job must exist and be 'if: github.event_name == 'workflow_dispatch''"
  else
    good android.yml "no PR release build, instrumented dispatch-only"
  fi
fi

# 7. Flutter: paths-ignore, no APK, AAB off PRs, iOS smoke gated on ios/pubspec.
if code flutter; then
  pi="$(grep -c 'paths-ignore:' "$tmp/flutter.yml")"
  aab="$(job flutter android)"
  ios="$(job flutter ios)"
  if [ "$pi" -lt 2 ]; then
    bad flutter.yml "pull_request and push must both carry paths-ignore"
  elif grep -qiE 'flutter build apk|assembleRelease|[*.]apk' "$tmp/flutter.yml"; then
    bad flutter.yml "no APK step (the AAB is what the store takes)"
  elif ! printf '%s\n' "$aab" | grep -q 'flutter build appbundle' \
       || ! printf '%s\n' "$aab" | grep -qE "github\.event_name != 'pull_request'"; then
    bad flutter.yml "AAB job must build an appbundle only when not pull_request"
  elif ! printf '%s\n' "$ios" | grep -qE "needs\.changes\.outputs\.ios == 'true'" \
       || ! grep -qE 'ios/' "$tmp/flutter.yml" || ! grep -qE 'pubspec' "$tmp/flutter.yml"; then
    bad flutter.yml "iOS smoke build must be gated on ios/** or pubspec.* changes"
  else
    good flutter.yml "paths-ignore, no APK, AAB off PRs, iOS smoke gated"
  fi
fi

# 8. tree-check: runs its own skip-logic test and this checker on the product's
#    workflows, so a drifted copy fails its own CI (company#383).
if code tree-check; then
  if ! has tree-check "bash \.github/scripts/identical-tree\.test\.sh" \
     || ! has tree-check "bash \.github/scripts/template-standard-check\.sh \.github/workflows"; then
    bad tree-check.yml "must run identical-tree.test.sh and template-standard-check.sh on .github/workflows"
  elif ! has tree-check "^ +\.github/workflows$"; then
    bad tree-check.yml "sparse-checkout must include .github/workflows"
  else
    good tree-check.yml "self-guarding (skip-logic test + standard check)"
  fi
fi

[ "$fail" = 0 ] && echo "template CI standard: ok"
exit "$fail"
