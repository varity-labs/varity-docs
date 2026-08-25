const dependencyManifests = new Set(['package.json', 'package-lock.json']);

function dependabotChangedOnlyDependencyManifests(event, changedFiles) {
  const author = event.pull_request?.user || {};
  return author.login === 'dependabot[bot]'
    && author.type === 'Bot'
    && Array.isArray(changedFiles)
    && changedFiles.length > 0
    && changedFiles.every((file) => dependencyManifests.has(file));
}

module.exports = { dependabotChangedOnlyDependencyManifests };
