#!/usr/bin/env bash

input=$(cat)
tool_name=$(jq -r '.tool_name // ""' <<<"$input")

case "$tool_name" in
  Read)
    haystack=$(jq -r '.tool_input.file_path // ""' <<<"$input")
    ;;
  Grep|Glob)
    haystack=$(jq -r '[.tool_input.path, .tool_input.glob, .tool_input.pattern] | map(select(. != null)) | join(" ")' <<<"$input")
    ;;
  Bash)
    haystack=$(jq -r '.tool_input.command // ""' <<<"$input")
    ;;
  *)
    exit 0
    ;;
esac

# Strip quotes so quoted paths still hit the boundary check below.
haystack=${haystack//\"/}
haystack=${haystack//\'/}

if [[ "$haystack" =~ (^|/|[[:space:]])(node_modules|target)(/|$|[[:space:]]) ]]; then
  project_name=$(basename "${CLAUDE_PROJECT_DIR:-$PWD}")

  cat >&2 <<MSG
Reading files inside node_modules/ or target/ is not allowed: these are downloaded or compiled artifacts, not the package's primary source.

Instead:
1. Try to find what you need on the web: official documentation, README, source code on GitHub, the package's crates.io/npm page.
2. If you specifically need that package version's source code, clone its repository into a temporary directory:
   /tmp/${project_name}-package-sources/<package-name>/
   and read the uncompiled source from there.
MSG

  exit 2
fi
