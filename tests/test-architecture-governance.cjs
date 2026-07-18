#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const required = {
  'CLAUDE.md': [
    '# CLAUDE.md - Varity Documentation',
    '## Verification',
    'ARCHITECTURE.md',
  ],
  'ARCHITECTURE.md': [
    '# Varity Documentation Architecture',
    '## Modules and interfaces',
    '## Content and artifact provenance',
    '## Build and publication flow',
    '## Failure semantics',
    '## Security and privacy',
  ],
};

const errors = [];

for (const [relativePath, markers] of Object.entries(required)) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    errors.push(`missing required architecture entrypoint: ${relativePath}`);
    continue;
  }

  const content = fs.readFileSync(absolutePath, 'utf8');
  for (const marker of markers) {
    if (!content.includes(marker)) {
      errors.push(`${relativePath} is missing required marker: ${marker}`);
    }
  }
}

const eventName = process.env.GITHUB_EVENT_NAME;
const eventPath = process.env.GITHUB_EVENT_PATH;

if (eventName === 'pull_request') {
  if (!eventPath || !fs.existsSync(eventPath)) {
    errors.push('pull_request event is missing GITHUB_EVENT_PATH');
  } else {
    const event = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
    const body = event.pull_request?.body || '';
    const impact = body.match(/^Architecture impact:\s*(none|updated)\s*$/im);
    const reason = body.match(/^Reason:\s*(.+)\s*$/im);
    const affected = body.match(/^Affected runtime services\/modules:\s*(.+)\s*$/im);
    const changed = body.match(/^Interfaces\/data\/security\/topology changed:\s*(.+)\s*$/im);
    const files = body.match(/^Architecture\/ADR files:\s*(.+)\s*$/im);

    if (!impact) errors.push('PR body must contain exactly "Architecture impact: none" or "Architecture impact: updated"');
    if (!reason || reason[1].includes('<!--')) errors.push('PR body must contain a concrete Reason');
    if (!affected) errors.push('PR body must name affected runtime services/modules or none');
    if (!changed) errors.push('PR body must declare interface/data/security/topology impact');
    if (!files) errors.push('PR body must name architecture/ADR files or none');
  }
}

if (errors.length > 0) {
  for (const error of errors) console.error(`FAIL ${error}`);
  process.exit(1);
}

console.log('PASS architecture governance entrypoints and declaration');
