# AGENTS.md

This file provides guidance to coding agents when working with code in this repository.

## Shipping a change

- **Every user-facing change ships with a changeset in the same commit** — add it yourself, unasked. An Electron upgrade counts.

  ```sh
  pnpm exec changeset add --minor chat-overlay -m "feat: Add a font size setting for chat messages"
  ```

  `--minor` for new features and substantial behavior changes, `--patch` for fixes and small changes — size decides the bump, not visibility. Start the summary with `feat:`/`fix:`/`perf:`/`chore:`, then **one capitalized plain sentence under ~80 chars, written for users** — no rationale, no mechanism, no second line. The prefix is stripped and the rest ships verbatim as the GitHub Release notes ([README](README.md#releasing)).
- No changeset for CI, docs, tests, dev-only tooling, or refactors with no user-visible effect.
- **Never bump `version` in `package.json`, push a `v*` tag, or hand-edit `CHANGELOG.md`** — merging the Release workflow's version PR does all three.

## Editing these instructions

`CLAUDE.md` is a symlink to `AGENTS.md` — **edit the real file.**
