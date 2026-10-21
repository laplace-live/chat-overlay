#!/usr/bin/env sh
# Publish a release whole: publish-release.sh <tag> <notes-file> [asset...]
# Releases are immutable once published, so assets go up while it's a draft (gh does draft, upload, publish).
# Safe to rerun: an already-published release is left alone, and a leftover draft is discarded and rebuilt,
# since its assets may be partial or stale and would be locked in by publishing it.
set -eu
tag=$1
notes=$2
shift 2

if ! grep -q '[^[:space:]]' "$notes"; then
  echo "::error::No release notes for $tag"
  exit 1
fi

# Prints true (draft), false (published) or none. One listing covers published releases and drafts, so a failed
# request is an error: `gh release view` reports "not found" when either of its two lookups fails.
release_state() {
  if ! drafts=$(gh api --paginate "repos/{owner}/{repo}/releases" --jq ".[] | select(.tag_name == \"$tag\") | .draft"); then
    echo "::error::Could not look up $tag" >&2
    return 1
  fi
  case $drafts in
    *false*) echo false ;;
    *true*) echo true ;;
    *) echo none ;;
  esac
}

for attempt in 1 2; do
  state=$(release_state)
  case $state in
    false)
      echo "$tag is already published; skipping."
      exit 0
      ;;
    true)
      echo "Discarding a leftover draft of $tag."
      gh release delete "$tag" --yes
      ;;
  esac
  if gh release create "$tag" "$@" --verify-tag --title "$tag" --notes-file "$notes"; then
    exit 0
  fi
  echo "Attempt $attempt to publish $tag failed."
done

echo "::error::Could not publish $tag"
exit 1
