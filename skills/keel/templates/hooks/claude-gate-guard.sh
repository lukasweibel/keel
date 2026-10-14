#!/usr/bin/env bash
# PreToolUse guard for Claude Code. Enforces Ground rule 2 from the keel
# skill mechanically: no Edit/Write/NotebookEdit outside doc/ while the
# active feature has not passed gate 1 yet. Requires jq.
set -euo pipefail

input="$(cat)"
tool_name="$(jq -r '.tool_name // empty' <<<"$input")"

case "$tool_name" in
  Edit|Write|NotebookEdit) ;;
  *) exit 0 ;;
esac

file_path="$(jq -r '.tool_input.file_path // .tool_input.notebook_path // empty' <<<"$input")"
[ -n "$file_path" ] || exit 0

cwd="$(jq -r '.cwd // empty' <<<"$input")"
[ -n "$cwd" ] || cwd="$PWD"

case "$file_path" in
  "$cwd"/doc/*|doc/*) exit 0 ;;
esac

state_file="$(ls -t "$cwd"/doc/*/keel-state.md 2>/dev/null | head -n1 || true)"
[ -n "$state_file" ] || exit 0

phase="$(grep -m1 '^Phase:' "$state_file" | sed -E 's/^Phase:[[:space:]]*//')"

if [ "$phase" = "inception" ]; then
  feature="$(basename "$(dirname "$state_file")")"
  echo "keel: gate 1 for '$feature' is not approved yet (phase: inception). No changes outside doc/ until then. See $state_file." >&2
  exit 2
fi

exit 0
