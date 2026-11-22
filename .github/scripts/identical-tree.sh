#!/usr/bin/env bash
# Decides whether a push to master is a squash merge whose tree is byte-for-byte
# the tree of the merged PR's head commit (company#350). If so, the PR
# run already tested exactly these files and the push-to-master test jobs can be
# skipped.
#
# Writes `identical=true|false` to $GITHUB_OUTPUT (stdout when unset). Fails open
# toward testing: any missing tool, API failure, no merged PR, or a tree
# mismatch yields `false`. This script never exits non-zero.
#
# The skip also requires the calling workflow's own `pull_request` run for the PR
# head SHA to be completed with conclusion success; a PR merged red, cancelled or
# still running is tested again. The workflow file is taken from
# GITHUB_WORKFLOW_REF, which in a reusable workflow is the caller's.
#
# Env: GITHUB_REPOSITORY, SHA (the pushed commit), GITHUB_WORKFLOW_REF, GH_TOKEN
# (read access to contents, pull requests and actions).
set -u

out="${GITHUB_OUTPUT:-/dev/stdout}"

say() { echo "identical=$1" >> "$out"; }
no() { echo "::notice::identical-tree: $1 - running the tests."; say false; exit 0; }

command -v gh >/dev/null 2>&1 || no "gh is not installed on this runner"
[ -n "${GITHUB_REPOSITORY:-}" ] && [ -n "${SHA:-}" ] || no "GITHUB_REPOSITORY or SHA is unset"

# A merged PR whose merge commit is this push, newest first; its head commit.
head_sha="$(gh api "repos/$GITHUB_REPOSITORY/commits/$SHA/pulls" \
  --jq "[.[] | select(.merged_at != null and .merge_commit_sha == \"$SHA\")][0].head.sha // empty" 2>/dev/null)" \
  || no "could not list the pull requests of $SHA"
[ -n "$head_sha" ] || no "no merged pull request found for $SHA"

push_tree="$(gh api "repos/$GITHUB_REPOSITORY/git/commits/$SHA" --jq .tree.sha 2>/dev/null)" \
  || no "could not read the tree of $SHA"
head_tree="$(gh api "repos/$GITHUB_REPOSITORY/git/commits/$head_sha" --jq .tree.sha 2>/dev/null)" \
  || no "could not read the tree of PR head $head_sha"
[ -n "$push_tree" ] && [ -n "$head_tree" ] || no "empty tree sha"

[ "$push_tree" = "$head_tree" ] || no "tree $push_tree differs from PR head $head_sha ($head_tree)"

# owner/repo/.github/workflows/web.yml@refs/heads/master -> web.yml
workflow="${GITHUB_WORKFLOW_REF:-}"
workflow="${workflow%%@*}"
workflow="${workflow##*/}"
[ -n "$workflow" ] || no "GITHUB_WORKFLOW_REF is unset"

run="$(gh run list --repo "$GITHUB_REPOSITORY" --workflow "$workflow" --commit "$head_sha" \
  --event pull_request --limit 1 --json status,conclusion \
  --jq '.[0] | select(. != null) | "\(.status)/\(.conclusion)"' 2>/dev/null)" \
  || no "could not read the $workflow pull_request run of $head_sha"
[ "$run" = "completed/success" ] || no "$workflow pull_request run of $head_sha is '${run:-missing}', not completed/success"

echo "::notice::identical-tree: $SHA has tree $push_tree, equal to PR head $head_sha, whose $workflow run succeeded - skipping the push tests."
say true
