#!/usr/bin/env sh
# Publish a release whole: publish-release.sh <tag> <notes-file> [asset...]
# Releases are immutable once published, so assets go up while it's a draft. Resumable: a rerun finishes a
# leftover draft and leaves an already-published release alone.
set -eu
tag=$1
notes=$2
shift 2

if ! grep -q '[^[:space:]]' "$notes"; then
  echo "::error::No release notes for $tag"
  exit 1
fi

state() {
  gh release view "$tag" --json isDraft --jq .isDraft 2>/dev/null || echo none
}

current=$(state)
if [ "$current" = none ]; then
  if gh release create "$tag" "$@" --verify-tag --title "$tag" --notes-file "$notes"; then
    exit 0
  fi
  # A failed create can leave its draft behind, or lose a race to another run: look again before giving up.
  current=$(state)
fi

case $current in
  false)
    echo "$tag is already published; skipping."
    ;;
  true)
    if [ $# -gt 0 ]; then gh release upload "$tag" "$@" --clobber; fi
    gh release edit "$tag" --title "$tag" --notes-file "$notes" --draft=false
    ;;
  *)
    echo "::error::Could not publish $tag"
    exit 1
    ;;
esac
