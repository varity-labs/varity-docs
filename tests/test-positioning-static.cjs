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
  { pattern: /\bprivy\b/gi, term: 'privy', fix: 'Use "auth provider" or "@varity-labs/ui-kit" instead — Privy is a hidden vendor name' },
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
  'ai-tools/prompts',
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

// VAR-389: ensure tutorial code examples use path-prefix format, not subdomain format.
// db.varity.app is a legitimate subdomain (SDK technical docs) and is already excluded via TECHNICAL_PATHS.
const SUBDOMAIN_URL_RE = /https?:\/\/[a-zA-Z0-9][a-zA-Z0-9-]*\.varity\.app/i;
for (const file of files) {
  if (isTechnicalFile(file)) continue;
  const rel = path.relative(DOCS_SRC, file);
  const fullSrc = fs.readFileSync(file, 'utf8');
  if (SUBDOMAIN_URL_RE.test(fullSrc)) {
    console.error(`FAIL [${rel}] uses subdomain URL format (*.varity.app) — use path-prefix format https://varity.app/{name}/ instead (VAR-389)`);
    totalViolations++;
  }
}

// VAR-506: ensure _redirects exists so 4everland CDN never falls through to raw IPFS gateway
const REDIRECTS_PATH = path.join(__dirname, '../public/_redirects');
if (!fs.existsSync(REDIRECTS_PATH)) {
  console.error('FAIL [public/_redirects] missing — without this file, 4everland falls through to raw IPFS gateway on all subpages (VAR-506)');
  totalViolations++;
} else {
  const redirectsContent = fs.readFileSync(REDIRECTS_PATH, 'utf8');
  if (!redirectsContent.includes('/* /index.html 200')) {
    console.error('FAIL [public/_redirects] must contain "/* /index.html 200" catch-all rule (VAR-506)');
    totalViolations++;
  }
}

if (totalViolations === 0) {
  console.log(`PASS — all ${files.length} docs files clean of high-severity positioning violations`);
  process.exit(0);
} else {
  console.error(`\n${totalViolations} violation(s) found — fix before committing`);
  process.exit(1);
}
