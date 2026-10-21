#!/usr/bin/env sh
# Print the body of a changesets CHANGELOG.md section: changelog-section.sh <CHANGELOG.md> <version>
# Fenced code blocks are skipped when looking for headings; a fence closes only on the same character, at least
# as long, with nothing after it.
awk -v heading="## $2" '
  function marker(line,    m) {
    if (!match(line, /^ ? ? ?(```+|~~~+)/)) return ""
    m = substr(line, RSTART, RLENGTH)
    sub(/^ +/, "", m)
    return m
  }
  {
    m = marker($0)
    if (fence != "") {
      if (m != "" && substr(m, 1, 1) == substr(fence, 1, 1) && length(m) >= length(fence) && $0 ~ /^ ? ? ?(`+|~+)[ \t]*$/) fence = ""
      if (found) print
      next
    }
    if (m != "") {
      fence = m
      if (found) print
      next
    }
    if (!found) {
      if ($0 == heading) found = 1
      next
    }
    if (/^## /) exit
    print
  }
' "$1"
