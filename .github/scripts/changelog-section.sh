#!/usr/bin/env sh
# Print the body of a changesets CHANGELOG.md section: changelog-section.sh <CHANGELOG.md> <version>
# A "## " line inside a fenced code block doesn't end the section.
awk -v heading="## $2" '
  !found { if ($0 == heading) found = 1; next }
  /^(```|~~~)/ { fence = !fence }
  !fence && /^## / { exit }
  { print }
' "$1"
