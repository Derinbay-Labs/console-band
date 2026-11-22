#!/usr/bin/env bash
# Proves identical-tree.sh's decisions with a stubbed `gh` - no network.
set -u
here="$(cd "$(dirname "$0")" && pwd)"
tmp="$(mktemp -d)"; trap 'rm -rf "$tmp"' EXIT
fail=0

# Stub: STUB_MODE selects the scenario. Answers are keyed on the API path.
cat > "$tmp/gh" <<'STUB'
#!/usr/bin/env bash
if [ "$1" = run ]; then # gh run list ... --jq: answer the already-filtered form
  case "$STUB_RUN" in
    green) echo "completed/success" ;;
    red) echo "completed/failure" ;;
    running) echo "in_progress/" ;;
    apifail) exit 1 ;;
    *) ;; # missing: empty
  esac
  exit 0
fi
path="$2"
case "$STUB_MODE:$path" in
  fail:*) exit 1 ;;
  nopr:*/pulls) exit 0 ;;
  *:*/pulls) echo "headsha" ;;
  same:*/git/commits/*) echo "tree1" ;;
  diff:*/git/commits/headsha) echo "tree2" ;;
  diff:*/git/commits/*) echo "tree1" ;;
esac
STUB
chmod +x "$tmp/gh"

check() { # name mode expected [run: green|red|running|missing|apifail]
  : > "$tmp/out"
  PATH="$tmp:$PATH" STUB_MODE="$2" STUB_RUN="${4:-green}" GITHUB_WORKFLOW_REF=o/r/.github/workflows/web.yml@refs/heads/master GITHUB_REPOSITORY=o/r SHA=abc GITHUB_OUTPUT="$tmp/out" bash "$here/identical-tree.sh" >/dev/null
  got="$(cat "$tmp/out")"
  if [ "$got" = "identical=$3" ]; then echo "ok    $1"; else echo "FAIL  $1: got '$got'"; fail=1; fi
}

check "same tree, green run skips"  same true green
check "same tree, red run tests"    same false red
check "same tree, running tests"    same false running
check "same tree, no run tests"     same false missing
check "same tree, run API fails"    same false apifail
check "different tree tests"  diff false
check "no merged PR tests"    nopr false
check "API failure tests"     fail false
exit "$fail"
