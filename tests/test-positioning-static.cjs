#!/usr/bin/env node
/**
 * Static positioning audit for varity-docs source files.
 * Scans .mdx/.md source files directly — no running server required.
 * Regression test for VAR-384 (blockchain jargon in deploy/component docs).
 *
 * Usage: node tests/test-positioning-static.cjs
 * Exit 0 = clean, Exit 1 = violations found
 */

const fs = require('fs');
const path = require('path');

const DOCS_SRC = path.join(__dirname, '../src/content/docs');

// Mirror the FORBIDDEN_WORDS from test-docs.cjs (HIGH-severity subset worth blocking CI on)
const HIGH_SEVERITY_PATTERNS = [
  { pattern: /\busdc\b/gi, term: 'usdc', fix: 'Use "payments" or "credit card" instead' },
  { pattern: /\bpaymaster\b/gi, term: 'paymaster', fix: 'Never mention gas sponsorship internals. Use "free for users" instead' },
  { pattern: /\berc-4337\b/gi, term: 'erc-4337', fix: 'Internal protocol — abstract away. Use "authentication" instead' },
  { pattern: /\bchain\s+id\b/gi, term: 'chain id', fix: 'Internal infrastructure detail — never expose to developers' },
  { pattern: /\bblockchain\b/gi, term: 'blockchain', fix: 'Use "distributed infrastructure" instead' },
  { pattern: /\bsmart contract\b/gi, term: 'smart contract', fix: 'Use "automated business logic" instead' },
  { pattern: /\bgas\s+fee\b/gi, term: 'gas fee', fix: 'Never mention gas. Users never see gas costs.' },
  { pattern: /\bdapp\b/gi, term: 'dapp', fix: 'Use "application" or "app" instead' },
  { pattern: /\bweb3\b/gi, term: 'web3', fix: 'Use "next-generation infrastructure" instead' },
  { pattern: /\bon-chain\b/gi, term: 'on-chain', fix: 'Use "tamper-proof" or "verifiable" instead' },
];

// Paths where technical jargon is acceptable (deep API reference / architecture docs).
// SDK package docs expose actual function names (formatUSDC etc.) that cannot be renamed
// without SDK refactors — excluded per RULE 0.5 (no SDK refactors until post-beta).
const TECHNICAL_PATHS = [
  'packages/sdk',
  'packages/types',
  'packages/ui-kit',
  'build/wallets',
  'build/compute',
  'resources/glossary',
  'ai-tools/mcp-server-spec',
];

// Collect all .mdx and .md files under docs src
function collectFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectFiles(full));
    } else if (entry.name.endsWith('.mdx') || entry.name.endsWith('.md')) {
      results.push(full);
    }
  }
  return results;
}

function isTechnicalFile(filePath) {
  const rel = path.relative(DOCS_SRC, filePath).replace(/\\/g, '/');
  return TECHNICAL_PATHS.some(tp => rel.includes(tp));
}

// Strip code blocks from source before checking prose
function stripCodeBlocks(src) {
  return src
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`\n]+`/g, '');
}

let totalViolations = 0;
const files = collectFiles(DOCS_SRC);

for (const file of files) {
  const rel = path.relative(DOCS_SRC, file);
  if (isTechnicalFile(file)) continue;

  const src = fs.readFileSync(file, 'utf8');
  const prose = stripCodeBlocks(src);

  for (const { pattern, term, fix } of HIGH_SEVERITY_PATTERNS) {
    const matches = prose.match(pattern);
    if (matches) {
      console.error(`FAIL [${rel}] "${term}" (${matches.length}x) — ${fix}`);
      totalViolations++;
    }
  }
}

if (totalViolations === 0) {
  console.log(`PASS — all ${files.length} docs files clean of high-severity positioning violations`);
  process.exit(0);
} else {
  console.error(`\n${totalViolations} violation(s) found — fix before committing`);
  process.exit(1);
}
