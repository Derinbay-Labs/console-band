#!/usr/bin/env bash
# Proves data-only.sh's decisions with a stubbed `gh` - no network.
set -u
here="$(cd "$(dirname "$0")" && pwd)"
tmp="$(mktemp -d)"; trap 'rm -rf "$tmp"' EXIT
fail=0

# Stub: STUB_FILES is the changed-file list (one per line), STUB_CMP the compare
# "status count" answer, STUB_RUN the BEFORE run state; STUB_FAIL=1 fails the API.
cat > "$tmp/gh" <<'STUB'
#!/usr/bin/env bash
[ "${STUB_FAIL:-0}" = 1 ] && exit 1
if [ "$1" = run ]; then
  case "$STUB_RUN" in
    green) echo "completed/success" ;;
    red) echo "completed/failure" ;;
    cancelled) echo "completed/cancelled" ;;
    apifail) exit 1 ;;
    *) ;; # missing: empty
  esac
  exit 0
fi
case "$*" in
  *'"\(.status) \(.files | length)"'*) echo "$STUB_CMP" ;;
  *) printf '%s\n' "$STUB_FILES" ;;
esac
STUB
chmod +x "$tmp/gh"

DATA='content/posts/*
drafts/*'

check() { # name "data_only must_test" event files [cmp] [run] [data] [before]
  : > "$tmp/out"
  PATH="$tmp:$PATH" EVENT="$3" STUB_FILES="$4" STUB_CMP="${5:-ahead 3}" STUB_RUN="${6:-green}" \
    DATA_PATHS="${7-$DATA}" PR=345 BEFORE="${8:-aaa}" SHA=bbb STUB_FAIL="${STUB_FAIL:-0}" \
    GITHUB_REPOSITORY=o/r GITHUB_WORKFLOW_REF=o/r/.github/workflows/web.yml@refs/heads/master \
    GITHUB_OUTPUT="$tmp/out" bash "$here/data-only.sh" >/dev/null
  got="$(sed 's/^[a-z_]*=//' "$tmp/out" | tr '
' ' ')"
  if [ "$got" = "$2 " ]; then echo "ok    $1"; else echo "FAIL  $1: got '$got'"; fail=1; fi
}

post='content/posts/x/index.tr.md
content/posts/x/cover.png
drafts/x/charts.py'

check "PR of posts and drafts skips"        "true false"  pull_request "$post"
check "PR touching code tests"              "false false" pull_request "$post
web/src/app/page.tsx"
check "PR touching another content dir"     "false false" pull_request "content/site/labs.yml"
check "no declared paths tests"             "false false" pull_request "$post" "" "" ""
check "dispatch tests"                      "false false" workflow_dispatch "$post"
check "push of posts after green run skips" "true false"  push "$post"
check "push after a red run tests"          "false true" push "$post" "ahead 3" red
check "push after a cancelled run tests"    "false true" push "$post" "ahead 3" cancelled
check "push with no run for BEFORE tests"   "false true" push "$post" "ahead 3" missing
check "push run API failure tests"          "false true" push "$post" "ahead 3" apifail
check "diverged push tests"                 "false true" push "$post" "diverged 3"
check "truncated compare tests"             "false true" push "$post" "ahead 300"
check "new branch push tests"               "false true" push "$post" "ahead 3" green "$DATA" 0000000000000000000000000000000000000000
check "push touching code after red run tests" "false false" push "$post
web/src/app/page.tsx" "ahead 3" red
STUB_FAIL=1 check "API failure tests"       "false false" pull_request "$post"
STUB_FAIL=1 check "push API failure overrides identical" "false true" push "$post"
exit "$fail"
