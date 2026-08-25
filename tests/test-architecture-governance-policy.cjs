#!/usr/bin/env node

const assert = require('assert');
const { dependabotChangedOnlyDependencyManifests } = require('./architecture-governance-policy.cjs');

const dependabot = {
  pull_request: { user: { login: 'dependabot[bot]', type: 'Bot' } },
};

assert.equal(dependabotChangedOnlyDependencyManifests(dependabot, ['package.json']), true);
assert.equal(
  dependabotChangedOnlyDependencyManifests(dependabot, ['package.json', 'package-lock.json']),
  true,
);
assert.equal(dependabotChangedOnlyDependencyManifests(dependabot, []), false);
assert.equal(dependabotChangedOnlyDependencyManifests(dependabot, null), false);
assert.equal(
  dependabotChangedOnlyDependencyManifests(dependabot, ['package.json', 'src/content/docs/index.mdx']),
  false,
);
assert.equal(
  dependabotChangedOnlyDependencyManifests(
    { pull_request: { user: { login: 'renovate[bot]', type: 'Bot' } } },
    ['package.json'],
  ),
  false,
);
assert.equal(
  dependabotChangedOnlyDependencyManifests(
    { pull_request: { user: { login: 'dependabot[bot]', type: 'User' } } },
    ['package.json'],
  ),
  false,
);
assert.equal(dependabotChangedOnlyDependencyManifests({}, ['package.json']), false);

console.log('PASS Dependabot architecture declaration exemption stays manifest-only and fail-closed');
