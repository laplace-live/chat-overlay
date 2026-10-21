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

# Prints true (draft), false (published) or none; any other lookup failure (auth, rate limit, network) is fatal.
release_state() {
  if out=$(gh release view "$tag" --json isDraft --jq .isDraft 2>&1); then
    echo "$out"
    return
  fi
  case $out in
    *"release not found"*) echo none ;;
    *)
      echo "::error::Could not look up $tag: $out" >&2
      return 1
      ;;
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
