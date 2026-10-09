// Changesets loads this with its own resolver (`await import`) during `changeset version`,
// under bare node — hence .mjs. It owns the `feat:`/`fix:` kind-prefix convention shared with
// laplace-persona: a summary opens with the kind, and getReleaseLine keeps that prefix out of
// CHANGELOG.md and the GitHub Release body. The bodies below are otherwise the stock
// @changesets/changelog-git output.

/** Summary prefixes stripped as a kind marker. */
const KIND_PREFIXES = new Set([
  'build',
  'chore',
  'ci',
  'docs',
  'feat',
  'feature',
  'fix',
  'improve',
  'improvement',
  'other',
  'perf',
  'refactor',
  'revert',
  'style',
  'test',
])

/**
 * Split a `feat: …` / `fix(scope)!: …` marker off a changeset summary. No marker (or an
 * unknown one) keeps the summary intact — prose wins.
 * @param {string} summary
 * @returns {string}
 */
function stripKind(summary) {
  const match = /^([a-z]+)(?:\([^)]*\))?!?:[ \t]+/.exec(summary)
  if (!match || !KIND_PREFIXES.has(match[1])) return summary.trim()
  return summary.slice(match[0].length).trim()
}

const changelogFunctions = {
  getReleaseLine: changeset => {
    const [firstLine, ...futureLines] = stripKind(changeset.summary)
      .split('\n')
      .map(l => l.trimEnd())
    let returnVal = `- ${changeset.commit ? `${changeset.commit.slice(0, 7)}: ` : ''}${firstLine}`
    if (futureLines.length > 0) returnVal += `\n${futureLines.map(l => `  ${l}`).join('\n')}`
    return returnVal
  },
  getDependencyReleaseLine: (changesets, dependenciesUpdated) => {
    if (dependenciesUpdated.length === 0) return ''
    const changesetLinks = changesets.map(
      changeset => `- Updated dependencies${changeset.commit ? ` [${changeset.commit.slice(0, 7)}]` : ''}`
    )
    const updatedDependenciesList = dependenciesUpdated.map(
      dependency => `  - ${dependency.name}@${dependency.newVersion}`
    )
    return [...changesetLinks, ...updatedDependenciesList].join('\n')
  },
}

export default changelogFunctions
