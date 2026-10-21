#!/usr/bin/env sh
# Print the body of a changesets CHANGELOG.md section: changelog-section.sh <CHANGELOG.md> <version>
awk -v heading="## $2" '$0 == heading { found = 1; next } found && /^## / { exit } found' "$1"
