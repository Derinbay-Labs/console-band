#!/usr/bin/env bash
# company#748: decide whether a run changed only declared data paths, so the
# caller can skip its tests and keep its build.
#
# A data path is a build input that no test reads (derinbay-com's
# `content/posts/*`: unit tests use inline text and e2e builds from fixtures, so
# only the build proves a post). Declaring a path a test DOES read (a testdata/
# directory, a config file) hides breakage: prove it first by corrupting a file
# there and checking that the tests stay green while the build fails.
#
# Env:
#   DATA_PATHS   newline- or space-separated bash `case` globs (`*` crosses `/`);
#                empty = never data-only (the template default).
#   EVENT        github.event_name.
#   PR           pull_request number (pull_request only).
#   BEFORE, SHA  the push range (push only).
#   GITHUB_REPOSITORY, GITHUB_WORKFLOW_REF  the caller's repo and workflow.
#
# Writes data_only=true|false and must_test=true|false to $GITHUB_OUTPUT and
# always exits 0. Any doubt, error or unknown answer is data_only=false: the
# tests run.
#
# On push, data-only alone is not proof: a cancelled or red code run before it
# would be skipped over and its code shipped untested. So a push is data-only
# only when the run of this workflow for BEFORE itself succeeded. And because a
# data-only PR run skipped its tests, its squash merge must not be skipped as an
# identical tree either: must_test=true then overrides tree-check's identical.
# must_test is also true when a push's file list is unknown (data paths
# declared), since the PR run may have been a data-only skip.
set -u

out="${GITHUB_OUTPUT:-/dev/stdout}"
must=false
say() { printf 'data_only=%s
must_test=%s
' "$1" "$must" >> "$out"; }
no() { echo "::notice::data-only: $1 - running the tests."; say false; exit 0; }

[ -n "${DATA_PATHS//[[:space:]]/}" ] || no "no data paths declared"
command -v gh >/dev/null 2>&1 || no "gh is not installed on this runner"
[ -n "${GITHUB_REPOSITORY:-}" ] || no "GITHUB_REPOSITORY is unset"
repo="$GITHUB_REPOSITORY"
tmp="$(mktemp)"; trap 'rm -f "$tmp"' EXIT

case "${EVENT:-}" in
  pull_request)
    [ -n "${PR:-}" ] || no "PR is unset"
    # Every file of the whole PR (renames list both names), not just the last push.
    gh api --paginate "repos/$repo/pulls/$PR/files" \
      --jq '.[] | .filename, (.previous_filename // empty)' > "$tmp" 2>/dev/null \
      || no "could not list the files of PR #$PR"
    ;;
  push)
    must=true # until the file list is known
    [ -n "${BEFORE:-}" ] && [ -n "${SHA:-}" ] || no "BEFORE or SHA is unset"
    case "$BEFORE" in *[!0]*) ;; *) no "new branch push, no previous commit" ;; esac
    cmp="$(gh api "repos/$repo/compare/$BEFORE...$SHA" \
      --jq '"\(.status) \(.files | length)"' 2>/dev/null)" || no "could not compare $BEFORE...$SHA"
    read -r st n <<< "$cmp"
    [ "${st:-}" = ahead ] || no "$SHA is not strictly ahead of $BEFORE (${st:-no answer})"
    # The compare API lists at most 300 files; a full page may be truncated.
    [ -n "${n:-}" ] && [ "$n" -lt 300 ] || no "compare lists ${n:-no} files, may be truncated"
    gh api "repos/$repo/compare/$BEFORE...$SHA" \
      --jq '.files[] | .filename, (.previous_filename // empty)' > "$tmp" 2>/dev/null \
      || no "could not list the files of $BEFORE...$SHA"
    must=false
    ;;
  *) no "event '${EVENT:-}' always tests" ;;
esac

[ -s "$tmp" ] || no "no changed files listed"
set -f # the globs are patterns, not filenames to expand
while IFS= read -r path; do
  [ -n "$path" ] || continue
  hit=0
  for glob in $DATA_PATHS; do
    # shellcheck disable=SC2254 # the glob is the pattern
    case "$path" in $glob) hit=1; break ;; esac
  done
  [ "$hit" = 1 ] || no "${path:0:120} is not a declared data path"
done < "$tmp"

if [ "$EVENT" = push ]; then
  must=true # every file is data: from here on, any doubt also overrides identical
  workflow="${GITHUB_WORKFLOW_REF:-}"; workflow="${workflow%%@*}"; workflow="${workflow##*/}"
  [ -n "$workflow" ] || no "GITHUB_WORKFLOW_REF is unset"
  run="$(gh run list --repo "$repo" --workflow "$workflow" --commit "$BEFORE" \
    --event push --limit 1 --json status,conclusion \
    --jq '.[0] | select(. != null) | "\(.status)/\(.conclusion)"' 2>/dev/null)" \
    || no "could not read the $workflow push run of $BEFORE"
  [ "$run" = "completed/success" ] || no "$workflow push run of $BEFORE is '${run:-missing}', not completed/success"
  must=false
fi

echo "::notice::data-only: every changed file is a declared data path - skipping the tests."
say true
