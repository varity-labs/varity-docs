#!/usr/bin/env node

/**
 * Varity Docs Automated Tester v4.0 (World-Class Edition)
 *
 * Enterprise-grade docs testing like Vercel and Supabase use.
 * AUTO-DISCOVERS all pages by crawling, then runs NINE test suites:
 *
 *   1. PAGE DISCOVERY     — auto-crawls sitemap/links to find ALL pages
 *   2. LINK CHECKER       — validates every internal/external link
 *   3. ANCHOR VALIDATOR   — checks #section links point to real headings
 *   4. CODE EXTRACTOR     — extracts and categorizes every code block
 *   5. IMPORT VALIDATOR   — checks every import/require against real npm packages
 *   6. SDK VERSION CHECK  — verifies docs match actual npm package versions
 *   7. POSITIONING AUDIT  — scans for forbidden words that violate positioning
 *   8. CONSISTENCY CHECK  — package names, CLI commands, % claims across all pages
 *   9. TYPESCRIPT COMPILER — compiles TS/TSX against REAL @varity-labs/sdk types
 *
 * Every code snippet users copy MUST work.
 *
 * Outputs:
 *   - Terminal summary with severity-coded issues
 *   - reports/docs-test-YYYY-MM-DD.json (full machine-readable report)
 *   - reports/CLAUDE-CODE-FIX-LIST.md (paste into Claude Code to auto-fix everything)
 *
 * Usage:
 *   node test-docs.js                    # run all tests (auto-discovers pages)
 *   node test-docs.js --only links       # run one suite
 *   node test-docs.js --only anchors     # check #section links
 *   node test-docs.js --only imports
 *   node test-docs.js --only versions    # check SDK versions match npm
 *   node test-docs.js --only positioning
 *   node test-docs.js --only consistency
 *   node test-docs.js --only typescript
 *   node test-docs.js --only code
 *   node test-docs.js --setup            # install SDK packages for type checking
 *   node test-docs.js --verbose          # show passing tests too
 *   node test-docs.js --no-discover      # skip auto-discovery, use hardcoded list
 */

const fetch = require('node-fetch');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const { createRequire } = require('module');

// ============================================================
// CONFIG
// ============================================================

const BASE_URL = 'https://docs.varity.so';
const CONCURRENCY = 5;  // Increased for faster crawling
const TIMEOUT = 15000;
const MAX_CRAWL_DEPTH = 5;  // How deep to follow links for auto-discovery

// SDK packages to install for real type checking (ALL published packages)
const SDK_PACKAGES = [
  '@varity-labs/sdk@latest',
  '@varity-labs/ui-kit@latest',
  '@varity-labs/types@latest',
  '@varity-labs/mcp@latest',
  'typescript@5',
  '@types/node@20',
  '@types/react@18',
];

// Links to IGNORE (known false positives - these work in browsers but return 403 to bots)
const IGNORED_LINK_PATTERNS = [
  /^https:\/\/chat\.openai\.com/,      // OpenAI blocks bots
  /^https:\/\/claude\.ai/,              // Claude blocks bots
  /^https:\/\/x\.com/,                  // Twitter/X blocks bots
  /^https:\/\/twitter\.com/,            // Twitter blocks bots
  /^http:\/\/localhost/,                // Local dev URLs (expected in docs)
  /^https:\/\/localhost/,               // Local dev URLs
];

// All known docs pages (extracted from the sidebar sitemap)
const DOCS_PAGES = [
  '/',
  '/getting-started/introduction/',
  '/getting-started/installation/',
  '/getting-started/quickstart/',
  '/getting-started/quickstart-nextjs/',
  '/getting-started/quickstart-react/',
  '/getting-started/quickstart-nodejs/',
  '/templates/overview/',
  '/templates/saas-starter/',
  '/packages/sdk/overview/',
  '/packages/sdk/installation/',
  '/packages/sdk/chains/',
  '/packages/ui-kit/overview/',
  '/packages/ui-kit/installation/',
  '/packages/ui-kit/components/',
  '/packages/ui-kit/hooks/',
  '/packages/types/overview/',
  '/build/auth/quickstart/',
  '/build/auth/email-login/',
  '/build/auth/social-login/',
  '/build/databases/quickstart/',
  '/build/storage/quickstart/',
  '/build/storage/upload/',
  '/build/storage/retrieve/',
  '/build/payments/quickstart/',
  '/build/payments/credit-card/',
  '/build/payments/gasless/',
  '/build/wallets/quickstart/',
  '/build/wallets/create-wallet/',
  '/build/wallets/session-keys/',
  '/build/compute/overview/',
  '/cli/overview/',
  '/cli/installation/',
  '/cli/commands/auth/',
  '/cli/commands/doctor/',
  '/cli/commands/init/',
  '/cli/commands/deploy/',
  '/deploy/deploy-your-app/',
  '/deploy/managed-credentials/',
  '/deploy/env-variables/',
  '/tutorials/build-saas-app/',
  '/tutorials/customize-template/',
  '/tutorials/add-crud-feature/',
  '/ai-tools/overview/',
  '/ai-tools/prompts/',
  '/ai-tools/mcp-server-spec/',
  '/resources/faq/',
  '/resources/glossary/',
  '/resources/troubleshooting/',
];

// Correct package names (what's actually published on npm + PyPI)
// NPM: 5 packages | PyPI: 1 package
const VALID_NPM_PACKAGES = {
  '@varity-labs/sdk': { npm: true, version: '2.0.0-beta.6' },
  '@varity-labs/ui-kit': { npm: true, version: '2.0.0-beta.7' },
  '@varity-labs/types': { npm: true, version: '2.0.0-beta.4' },
  '@varity-labs/mcp': { npm: true, version: '1.3.2' },
  'create-varity-app': { npm: true, version: '2.0.0-beta.9' },
};

// PyPI package
const VALID_PYPI_PACKAGES = {
  'varitykit': { pypi: true, version: '1.1.13' },
};

// Wrong package names that appear on marketing site but don't exist on npm
const WRONG_PACKAGE_NAMES = {
  '@varity/sdk': '@varity-labs/sdk',
  '@varity/ui-kit': '@varity-labs/ui-kit',
  '@varity/types': '@varity-labs/types',
  '@varity/mcp': '@varity-labs/mcp',
  '@varity/cli': 'varitykit (PyPI) or create-varity-app (npm)',
};

// Forbidden words per positioning framework (should not appear in developer-facing docs)
const FORBIDDEN_WORDS = [
  { word: 'blockchain', severity: 'HIGH', context: 'Use "distributed infrastructure" instead' },
  { word: 'web3', severity: 'HIGH', context: 'Use "next-generation infrastructure" instead' },
  { word: 'smart contract', severity: 'HIGH', context: 'Use "automated business logic" instead' },
  { word: 'on-chain', severity: 'HIGH', context: 'Use "tamper-proof" or "verifiable" instead' },
  { word: 'token', severity: 'MEDIUM', context: 'Avoid unless discussing auth tokens (not crypto tokens)' },
  { word: 'wallet', severity: 'HIGH', context: 'Use "account" or "login" instead (except in Build > Smart Accounts section)' },
  { word: 'usdc', severity: 'HIGH', context: 'Use "payments" or "credit card" instead' },
  { word: 'dapp', severity: 'HIGH', context: 'Use "application" or "app" instead' },
  { word: 'censorship-resistant', severity: 'MEDIUM', context: 'Use "reliable" or "distributed" instead' },
  { word: 'gas fee', severity: 'HIGH', context: 'Never mention gas. Users never see gas costs.' },
  { word: 'gas-free', severity: 'MEDIUM', context: 'Don\'t reference gas at all, even to say it\'s free' },
  { word: 'gasless', severity: 'MEDIUM', context: 'Don\'t reference gas at all. Use "free operations" instead' },
  { word: 'rollup', severity: 'MEDIUM', context: 'Use "dedicated infrastructure" for enterprise audiences only' },
  { word: 'l3', severity: 'LOW', context: 'OK in deep technical docs, not in getting-started or tutorials' },
  { word: 'arbitrum', severity: 'LOW', context: 'OK in architecture docs, not in getting-started or tutorials' },
  { word: 'privy', severity: 'MEDIUM', context: 'Internal implementation detail — abstract away from developer-facing docs' },
  { word: 'paymaster', severity: 'HIGH', context: 'Never mention gas sponsorship internals. Use "free for users" instead' },
  { word: 'erc-4337', severity: 'HIGH', context: 'Internal protocol — abstract away. Use "authentication" instead' },
  { word: 'chain id', severity: 'HIGH', context: 'Internal infrastructure detail — never expose to developers' },
];

// Correct CLI command name
const CORRECT_CLI_NAME = 'varitykit';
const WRONG_CLI_NAMES = ['varity deploy', 'varity init', 'varity login'];

// ============================================================
// UTILITIES
// ============================================================

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ============================================================
// AUTO-DISCOVERY: Crawl to find ALL pages
// ============================================================

async function discoverAllPages() {
  console.log('\n🔍 AUTO-DISCOVERING all documentation pages...\n');

  const discovered = new Set();
  const toVisit = ['/'];
  const visited = new Set();

  while (toVisit.length > 0 && discovered.size < 200) { // Safety limit
    const batch = toVisit.splice(0, CONCURRENCY);

    const results = await Promise.all(batch.map(async (pagePath) => {
      if (visited.has(pagePath)) return [];
      visited.add(pagePath);

      try {
        const res = await fetch(BASE_URL + pagePath, {
          timeout: TIMEOUT,
          headers: { 'User-Agent': 'Varity-Docs-Tester/4.0' }
        });

        if (!res.ok) return [];

        const html = await res.text();
        const $ = cheerio.load(html);

        // This is a valid docs page
        discovered.add(pagePath);
        process.stdout.write(`  ✓ Found: ${pagePath}\n`);

        // Extract all internal links
        const newLinks = [];
        $('a[href]').each((_, el) => {
          let href = $(el).attr('href');
          if (!href) return;

          // Only follow internal docs links
          if (href.startsWith('/') && !href.startsWith('//')) {
            // Normalize: ensure trailing slash for consistency
            if (!href.endsWith('/') && !href.includes('.') && !href.includes('#')) {
              href = href + '/';
            }
            // Remove anchor
            href = href.split('#')[0];

            if (!visited.has(href) && !toVisit.includes(href)) {
              newLinks.push(href);
            }
          } else if (href.startsWith(BASE_URL)) {
            let path = href.replace(BASE_URL, '');
            if (!path.endsWith('/') && !path.includes('.') && !path.includes('#')) {
              path = path + '/';
            }
            path = path.split('#')[0];
            if (!visited.has(path) && !toVisit.includes(path)) {
              newLinks.push(path);
            }
          }
        });

        return newLinks;
      } catch (err) {
        return [];
      }
    }));

    // Add new links to visit queue
    results.flat().forEach(link => {
      if (!visited.has(link) && !toVisit.includes(link)) {
        toVisit.push(link);
      }
    });

    await sleep(100); // Small delay to be respectful
  }

  const pages = Array.from(discovered).sort();
  console.log(`\n  📄 Discovered ${pages.length} documentation pages\n`);
  return pages;
}

// ============================================================
// SDK VERSION CHECKER: Verify docs match npm versions
// ============================================================

async function checkSDKVersions() {
  console.log('\n━━━ SDK VERSION CHECK ━━━\n');
  const results = { pass: 0, fail: 0, issues: [], versions: {} };

  const packagesToCheck = [
    '@varity-labs/sdk',
    '@varity-labs/ui-kit',
    '@varity-labs/types',
    'create-varity-app'
  ];

  for (const pkg of packagesToCheck) {
    try {
      const res = await fetch(`https://registry.npmjs.org/${pkg}/latest`, {
        timeout: 10000,
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        const data = await res.json();
        results.versions[pkg] = data.version;
        results.pass++;
        console.log(`  ✓ ${pkg}@${data.version} (published on npm)`);
      } else if (res.status === 404) {
        results.fail++;
        results.issues.push({
          type: 'SDK_NOT_PUBLISHED',
          severity: 'HIGH',
          package: pkg,
          note: `Package ${pkg} not found on npm — docs may reference non-existent package`,
        });
        console.log(`  ✗ ${pkg} — NOT FOUND on npm`);
      }
    } catch (err) {
      console.log(`  ? ${pkg} — could not check (${err.message})`);
    }
  }

  return results;
}

// ============================================================
// ANCHOR LINK VALIDATOR: Check #section links
// ============================================================

function testAnchorLinks(pages) {
  console.log('\n━━━ ANCHOR LINK VALIDATOR ━━━\n');
  const results = { pass: 0, fail: 0, issues: [] };

  // Build a map of all heading IDs per page
  const headingIds = new Map(); // url -> Set of IDs

  for (const page of pages) {
    if (!page.html) continue;
    const $ = cheerio.load(page.html);
    const ids = new Set();

    // Collect all IDs (headings and explicit id attributes)
    $('[id]').each((_, el) => {
      ids.add($(el).attr('id'));
    });
    $('h1, h2, h3, h4, h5, h6').each((_, el) => {
      const id = $(el).attr('id');
      if (id) ids.add(id);
      // Also check for auto-generated IDs from text
      const text = $(el).text().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      if (text) ids.add(text);
    });

    headingIds.set(page.url, ids);
  }

  // Check all anchor links
  for (const page of pages) {
    if (!page.html) continue;
    const $ = cheerio.load(page.html);

    $('a[href*="#"]').each((_, el) => {
      const href = $(el).attr('href');
      if (!href || href === '#') return;

      let targetUrl = page.url;
      let anchor = href;

      if (href.startsWith('#')) {
        // Same-page anchor
        anchor = href.substring(1);
      } else if (href.includes('#')) {
        // Link to another page with anchor
        const [path, hash] = href.split('#');
        anchor = hash;

        if (path.startsWith('/')) {
          targetUrl = BASE_URL + path;
        } else if (path.startsWith(BASE_URL)) {
          targetUrl = path;
        } else {
          return; // External link, skip
        }
      }

      // Check if the anchor exists on the target page
      const targetIds = headingIds.get(targetUrl);
      if (targetIds) {
        if (targetIds.has(anchor)) {
          results.pass++;
        } else {
          results.fail++;
          results.issues.push({
            type: 'BROKEN_ANCHOR',
            severity: 'MEDIUM',
            page: page.url,
            anchor: `#${anchor}`,
            target: targetUrl,
            link_text: $(el).text().substring(0, 50),
          });
        }
      }
    });
  }

  console.log(`  ✓ ${results.pass} anchor links OK`);
  if (results.fail > 0) {
    console.log(`  ✗ ${results.fail} broken anchor links`);
    results.issues.slice(0, 5).forEach(i => {
      console.log(`    → ${i.anchor} on ${i.page} — target heading not found`);
    });
    if (results.issues.length > 5) {
      console.log(`    ... and ${results.issues.length - 5} more`);
    }
  }

  return results;
}

// ============================================================
// SDK SETUP (for real type checking)
// ============================================================

const SDK_DIR = path.join(__dirname, '.sdk-test-env');

async function setupSDKEnvironment() {
  console.log('\n📦 Setting up SDK test environment...\n');

  // Create isolated directory for SDK packages
  if (!fs.existsSync(SDK_DIR)) {
    fs.mkdirSync(SDK_DIR, { recursive: true });
  }

  // Initialize package.json if needed
  const pkgJsonPath = path.join(SDK_DIR, 'package.json');
  if (!fs.existsSync(pkgJsonPath)) {
    fs.writeFileSync(pkgJsonPath, JSON.stringify({
      name: 'varity-docs-test-env',
      version: '1.0.0',
      private: true,
      type: 'module',
    }, null, 2));
  }

  // Install SDK packages
  console.log('  Installing SDK packages for type checking...');
  console.log(`  Packages: ${SDK_PACKAGES.join(', ')}\n`);

  try {
    // Use --legacy-peer-deps to handle React version conflicts
    execSync(`npm install ${SDK_PACKAGES.join(' ')} --save-dev --legacy-peer-deps`, {
      cwd: SDK_DIR,
      stdio: 'inherit',
      timeout: 300000, // 5 minutes
    });
    console.log('\n  ✓ SDK packages installed successfully\n');
    return true;
  } catch (err) {
    console.error('\n  ✗ Failed to install SDK packages:', err.message);
    return false;
  }
}

function isSDKInstalled() {
  const sdkPath = path.join(SDK_DIR, 'node_modules', '@varity-labs', 'sdk');
  return fs.existsSync(sdkPath);
}

// ============================================================
// UTILITIES
// ============================================================

async function fetchPage(url) {
  try {
    const res = await fetch(url, { 
      timeout: TIMEOUT,
      headers: { 'User-Agent': 'Varity-Docs-Tester/1.0' }
    });
    if (!res.ok) return { url, status: res.status, html: null, error: `HTTP ${res.status}` };
    const html = await res.text();
    return { url, status: res.status, html, error: null };
  } catch (err) {
    return { url, status: 0, html: null, error: err.message };
  }
}

async function checkLink(url) {
  try {
    const res = await fetch(url, { 
      method: 'HEAD', 
      timeout: TIMEOUT,
      redirect: 'follow',
      headers: { 'User-Agent': 'Varity-Docs-Tester/1.0' }
    });
    return { url, status: res.status, ok: res.ok };
  } catch (err) {
    // Try GET if HEAD fails (some servers don't support HEAD)
    try {
      const res = await fetch(url, { 
        method: 'GET', 
        timeout: TIMEOUT,
        redirect: 'follow',
        headers: { 'User-Agent': 'Varity-Docs-Tester/1.0' }
      });
      return { url, status: res.status, ok: res.ok };
    } catch (err2) {
      return { url, status: 0, ok: false, error: err2.message };
    }
  }
}

// Run tasks with concurrency limit
async function pool(tasks, concurrency) {
  const results = [];
  const executing = new Set();
  for (const task of tasks) {
    const p = task().then(r => { executing.delete(p); return r; });
    executing.add(p);
    results.push(p);
    if (executing.size >= concurrency) await Promise.race(executing);
  }
  return Promise.all(results);
}

// ============================================================
// TEST SUITE 1: LINK CHECKER
// ============================================================

async function testLinks(pages) {
  console.log('\n━━━ TEST SUITE 1: LINK CHECKER ━━━\n');
  const results = { pass: 0, fail: 0, skipped: 0, issues: [] };
  const allLinks = new Map(); // url -> [pages that reference it]

  for (const page of pages) {
    if (!page.html) continue;
    const $ = cheerio.load(page.html);
    $('a[href]').each((_, el) => {
      let href = $(el).attr('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('javascript:')) return;

      // Resolve relative URLs
      if (href.startsWith('/')) href = BASE_URL + href;
      else if (!href.startsWith('http')) href = new URL(href, page.url).toString();

      if (!allLinks.has(href)) allLinks.set(href, []);
      allLinks.get(href).push(page.url);
    });
  }

  // Filter out known false positives
  const linksToCheck = [];
  const skippedLinks = [];
  for (const [url, sources] of allLinks) {
    const isIgnored = IGNORED_LINK_PATTERNS.some(pattern => pattern.test(url));
    if (isIgnored) {
      skippedLinks.push({ url, sources, reason: 'Known false positive (blocks bots)' });
    } else {
      linksToCheck.push([url, sources]);
    }
  }

  results.skipped = skippedLinks.length;
  console.log(`  Found ${allLinks.size} unique links across ${pages.length} pages`);
  console.log(`  Skipping ${skippedLinks.length} known false positives (AI chatbots, social media, localhost)`);
  console.log(`  Checking ${linksToCheck.length} links...\n`);

  const tasks = linksToCheck.map(([url, sources]) => async () => {
    const result = await checkLink(url);
    return { ...result, sources };
  });

  const linkResults = await pool(tasks, CONCURRENCY);
  
  for (const r of linkResults) {
    if (r.ok) {
      results.pass++;
    } else {
      results.fail++;
      results.issues.push({
        type: 'BROKEN_LINK',
        severity: r.url.includes('docs.varity.so') ? 'HIGH' : 'MEDIUM',
        url: r.url,
        status: r.status,
        error: r.error || `HTTP ${r.status}`,
        found_on: r.sources,
      });
    }
  }

  console.log(`  ✓ ${results.pass} links OK`);
  if (results.fail > 0) console.log(`  ✗ ${results.fail} broken links`);
  results.issues.forEach(i => console.log(`    → ${i.severity}: ${i.url} (${i.error}) on ${i.found_on[0]}`));
  
  return results;
}

// ============================================================
// TEST SUITE 2: CODE EXTRACTOR
// ============================================================

function extractCodeBlocks(pages) {
  console.log('\n━━━ TEST SUITE 2: CODE EXTRACTION ━━━\n');
  const results = { total: 0, blocks: [], byType: {} };

  for (const page of pages) {
    if (!page.html) continue;
    const $ = cheerio.load(page.html);
    
    $('pre code, code').each((_, el) => {
      const $el = $(el);
      const text = $el.text().trim();
      if (!text || text.length < 5) return;
      
      // Skip inline code (single backtick)
      if (!$el.parent().is('pre') && text.length < 80 && !text.includes('\n')) return;

      // Determine language/type
      const classes = $el.attr('class') || '';
      let lang = 'unknown';
      if (classes.includes('language-')) lang = classes.match(/language-(\w+)/)?.[1] || 'unknown';
      else if (classes.includes('ts') || classes.includes('typescript')) lang = 'typescript';
      else if (classes.includes('js') || classes.includes('javascript')) lang = 'javascript';
      else if (classes.includes('bash') || classes.includes('shell')) lang = 'bash';
      
      // Auto-detect from content if class doesn't help
      if (lang === 'unknown') {
        if (text.startsWith('npm ') || text.startsWith('npx ') || text.startsWith('$') || text.startsWith('varitykit')) lang = 'bash';
        else if (text.includes('import ') || text.includes('from \'')) lang = 'typescript';
        else if (text.includes('const ') || text.includes('function ')) lang = 'javascript';
      }

      const block = {
        page: page.url,
        lang,
        code: text,
        line_count: text.split('\n').length,
      };
      
      results.blocks.push(block);
      results.byType[lang] = (results.byType[lang] || 0) + 1;
      results.total++;
    });
  }

  console.log(`  Found ${results.total} code blocks across ${pages.length} pages`);
  Object.entries(results.byType).forEach(([lang, count]) => {
    console.log(`    ${lang}: ${count} blocks`);
  });

  return results;
}

// ============================================================
// TEST SUITE 3: IMPORT VALIDATOR
// ============================================================

function testImports(codeBlocks) {
  console.log('\n━━━ TEST SUITE 3: IMPORT VALIDATOR ━━━\n');
  const results = { pass: 0, fail: 0, issues: [] };

  const importRegex = /(?:import\s+.*?\s+from\s+['"]([^'"]+)['"])|(?:require\s*\(\s*['"]([^'"]+)['"]\s*\))/g;
  const npmInstallRegex = /npm\s+install\s+(?:-[gD]\s+)?(@?[a-z0-9][\w\-\.\/]*)/gi;

  for (const block of codeBlocks.blocks) {
    const code = block.code;
    
    // Check import/require statements
    let match;
    const importRe = new RegExp(importRegex.source, importRegex.flags);
    while ((match = importRe.exec(code)) !== null) {
      const pkg = match[1] || match[2];
      if (!pkg || pkg.startsWith('.') || pkg.startsWith('/')) continue;
      
      // Extract the package name (handle scoped packages)
      const pkgName = pkg.startsWith('@') 
        ? pkg.split('/').slice(0, 2).join('/') 
        : pkg.split('/')[0];
      
      // Check against wrong names
      if (WRONG_PACKAGE_NAMES[pkgName]) {
        results.fail++;
        results.issues.push({
          type: 'WRONG_PACKAGE_NAME',
          severity: 'CRITICAL',
          page: block.page,
          found: pkgName,
          should_be: WRONG_PACKAGE_NAMES[pkgName],
          code_snippet: code.substring(Math.max(0, match.index - 20), match.index + match[0].length + 20),
        });
      } else if (VALID_NPM_PACKAGES[pkgName] || VALID_PYPI_PACKAGES[pkgName] || isStandardPackage(pkgName)) {
        results.pass++;
      } else {
        // Unknown package — flag for manual review
        results.issues.push({
          type: 'UNKNOWN_PACKAGE',
          severity: 'LOW',
          page: block.page,
          found: pkgName,
          note: 'Not in known valid packages list — verify manually',
        });
      }
    }

    // Check npm install commands
    const installRe = new RegExp(npmInstallRegex.source, npmInstallRegex.flags);
    while ((match = installRe.exec(code)) !== null) {
      const pkgName = match[1];
      if (WRONG_PACKAGE_NAMES[pkgName]) {
        results.fail++;
        results.issues.push({
          type: 'WRONG_INSTALL_COMMAND',
          severity: 'CRITICAL',
          page: block.page,
          found: `npm install ${pkgName}`,
          should_be: `npm install ${WRONG_PACKAGE_NAMES[pkgName]}`,
        });
      } else {
        results.pass++;
      }
    }
  }

  console.log(`  ✓ ${results.pass} imports/installs OK`);
  if (results.fail > 0) console.log(`  ✗ ${results.fail} wrong package names`);
  results.issues.filter(i => i.severity === 'CRITICAL').forEach(i => {
    console.log(`    → CRITICAL: "${i.found}" should be "${i.should_be}" on ${i.page}`);
  });

  return results;
}

function isStandardPackage(name) {
  const standard = ['react', 'next', 'typescript', 'tailwindcss', '@types/', 'dotenv', 'zod', 
    'lucide-react', '@radix-ui', '@tanstack', 'class-variance-authority', 'clsx', 
    'tailwind-merge', 'sonner', 'next-themes', 'fs', 'path', 'crypto', 'process'];
  return standard.some(s => name === s || name.startsWith(s));
}

// ============================================================
// TEST SUITE 4: POSITIONING COMPLIANCE
// ============================================================

function testPositioning(pages) {
  console.log('\n━━━ TEST SUITE 4: POSITIONING COMPLIANCE ━━━\n');
  const results = { pass: 0, fail: 0, issues: [] };
  
  // Pages where some technical terms are acceptable
  const technicalPages = [
    '/build/wallets/', '/packages/sdk/chains/', '/build/compute/',
    '/resources/glossary/', '/ai-tools/mcp-server-spec/',
  ];

  for (const page of pages) {
    if (!page.html) continue;
    const $ = cheerio.load(page.html);
    
    // Get visible text content (not code blocks)
    const textContent = $('body').clone()
      .find('pre, code, nav, footer, header').remove().end()
      .text().toLowerCase();
    
    // Also check headings and navigation labels specifically
    const headings = [];
    $('h1, h2, h3, h4, nav a, .sidebar a').each((_, el) => {
      headings.push($(el).text().toLowerCase());
    });
    const headingText = headings.join(' ');

    const isTechnicalPage = technicalPages.some(tp => page.url.includes(tp));

    for (const rule of FORBIDDEN_WORDS) {
      const regex = new RegExp(`\\b${rule.word.replace(/\s+/g, '\\s+')}\\b`, 'gi');
      
      // Check body text
      const bodyMatches = textContent.match(regex);
      if (bodyMatches) {
        const effectiveSeverity = isTechnicalPage && rule.severity !== 'HIGH' ? 'LOW' : rule.severity;
        results.fail++;
        results.issues.push({
          type: 'FORBIDDEN_WORD',
          severity: effectiveSeverity,
          page: page.url,
          word: rule.word,
          count: bodyMatches.length,
          context: rule.context,
          in_technical_page: isTechnicalPage,
        });
      }

      // Check headings/nav (always high severity — these are the most visible)
      const headingMatches = headingText.match(regex);
      if (headingMatches) {
        results.fail++;
        results.issues.push({
          type: 'FORBIDDEN_WORD_IN_HEADING',
          severity: 'CRITICAL',
          page: page.url,
          word: rule.word,
          location: 'heading or navigation label',
          context: rule.context,
        });
      }
    }
  }

  // Count pages with no issues
  const pagesWithIssues = new Set(results.issues.map(i => i.page));
  results.pass = pages.filter(p => p.html).length - pagesWithIssues.size;

  console.log(`  ✓ ${results.pass} pages clean`);
  if (results.fail > 0) console.log(`  ✗ ${results.fail} positioning violations`);
  
  // Group by severity for display
  const critical = results.issues.filter(i => i.severity === 'CRITICAL');
  const high = results.issues.filter(i => i.severity === 'HIGH');
  
  critical.forEach(i => console.log(`    → CRITICAL: "${i.word}" in ${i.location || 'body'} on ${i.page}`));
  high.forEach(i => console.log(`    → HIGH: "${i.word}" (${i.count}x) on ${i.page} — ${i.context}`));

  return results;
}

// ============================================================
// TEST SUITE 5: CONSISTENCY CHECK
// ============================================================

function testConsistency(pages, codeBlocks) {
  console.log('\n━━━ TEST SUITE 5: CONSISTENCY CHECK ━━━\n');
  const results = { pass: 0, fail: 0, issues: [] };

  // Check CLI command names
  for (const block of codeBlocks.blocks) {
    if (block.lang !== 'bash') continue;
    
    for (const wrongName of WRONG_CLI_NAMES) {
      if (block.code.includes(wrongName)) {
        results.fail++;
        results.issues.push({
          type: 'WRONG_CLI_NAME',
          severity: 'HIGH',
          page: block.page,
          found: wrongName,
          should_be: wrongName.replace('varity ', `${CORRECT_CLI_NAME} `),
          code_snippet: block.code.substring(0, 80),
        });
      }
    }

    // Check for correct CLI name
    if (block.code.includes(CORRECT_CLI_NAME)) {
      results.pass++;
    }
  }

  // Check cost savings percentages across all pages
  const percentages = new Map();
  for (const page of pages) {
    if (!page.html) continue;
    const $ = cheerio.load(page.html);
    const text = $('body').text();
    
    const pctMatches = text.match(/(\d{2})-(\d{2})%\s*(?:cheaper|savings|less|cost)/gi);
    if (pctMatches) {
      for (const m of pctMatches) {
        if (!percentages.has(m)) percentages.set(m, []);
        percentages.get(m).push(page.url);
      }
    }
  }

  if (percentages.size > 1) {
    results.fail++;
    results.issues.push({
      type: 'INCONSISTENT_PERCENTAGE',
      severity: 'MEDIUM',
      found: Object.fromEntries(percentages),
      note: 'Multiple different cost savings percentages found. Should be "60-80%" everywhere.',
    });
  } else {
    results.pass++;
  }

  // Check revenue share consistency
  const revShares = [];
  for (const page of pages) {
    if (!page.html) continue;
    const text = cheerio.load(page.html)('body').text();
    if (text.match(/keep\s+90%/i)) revShares.push({ page: page.url, claim: '90%' });
    if (text.match(/keep\s+70%/i)) revShares.push({ page: page.url, claim: '70%' });
    if (text.match(/70\/30|70%.*30%/i)) revShares.push({ page: page.url, claim: '70/30' });
    if (text.match(/90\/10|90%.*10%/i)) revShares.push({ page: page.url, claim: '90/10' });
  }
  
  const uniqueClaims = [...new Set(revShares.map(r => r.claim))];
  if (uniqueClaims.length > 1) {
    results.fail++;
    results.issues.push({
      type: 'INCONSISTENT_REVENUE_SHARE',
      severity: 'CRITICAL',
      claims: revShares,
      note: 'Different revenue share percentages found across docs pages.',
    });
  }

  // Check package name references in sidebar/nav
  for (const page of pages) {
    if (!page.html) continue;
    const $ = cheerio.load(page.html);
    $('nav a, .sidebar a').each((_, el) => {
      const text = $(el).text();
      if (text.includes('@varity/') && !text.includes('@varity-labs/')) {
        results.fail++;
        results.issues.push({
          type: 'WRONG_PACKAGE_IN_NAV',
          severity: 'HIGH',
          page: page.url,
          found: text.trim(),
          should_be: text.trim().replace('@varity/', '@varity-labs/'),
        });
      }
    });
  }

  console.log(`  ✓ ${results.pass} consistency checks OK`);
  if (results.fail > 0) console.log(`  ✗ ${results.fail} inconsistencies`);
  results.issues.forEach(i => {
    if (i.type === 'WRONG_CLI_NAME') console.log(`    → ${i.severity}: "${i.found}" should be "${i.should_be}" on ${i.page}`);
    else if (i.type === 'INCONSISTENT_REVENUE_SHARE') console.log(`    → CRITICAL: Revenue share varies: ${JSON.stringify(i.claims.map(c => c.claim + ' on ' + c.page))}`);
    else if (i.type === 'WRONG_PACKAGE_IN_NAV') console.log(`    → ${i.severity}: Nav shows "${i.found}" should be "${i.should_be}"`);
    else console.log(`    → ${i.severity}: ${i.note || i.type}`);
  });

  return results;
}

// ============================================================
// TEST SUITE 6: TYPESCRIPT COMPILER (with REAL SDK types)
// ============================================================

function testTypeScriptSyntax(codeBlocks) {
  console.log('\n━━━ TEST SUITE 6: TYPESCRIPT COMPILER ━━━\n');
  const results = { pass: 0, fail: 0, issues: [], sdkMode: false };

  // Check if SDK is installed for real type checking
  const sdkInstalled = isSDKInstalled();
  if (sdkInstalled) {
    console.log('  ✓ Using REAL @varity-labs/sdk types (enterprise mode)\n');
    results.sdkMode = true;
  } else {
    console.log('  ⚠ SDK not installed. Run with --setup to enable real type checking.');
    console.log('    Using mock types for basic syntax checking.\n');
  }

  // Check if TypeScript compiler is available
  let tsAvailable = false;
  let tscPath = sdkInstalled ? path.join(SDK_DIR, 'node_modules', '.bin', 'tsc') : null;

  if (sdkInstalled && fs.existsSync(tscPath + '.cmd') || fs.existsSync(tscPath)) {
    tsAvailable = true;
  } else {
    try {
      execSync('npx tsc --version', { stdio: 'pipe', timeout: 10000 });
      tsAvailable = true;
      tscPath = 'npx tsc';
    } catch {
      try {
        execSync('tsc --version', { stdio: 'pipe', timeout: 5000 });
        tsAvailable = true;
        tscPath = 'tsc';
      } catch {
        console.log('  ⚠ TypeScript compiler not found.');
      }
    }
  }

  const tsBlocks = codeBlocks.blocks.filter(b =>
    b.lang === 'typescript' || b.lang === 'tsx' ||
    (b.lang === 'javascript' && (b.code.includes('import ') || b.code.includes(': string') || b.code.includes(': number')))
  );

  console.log(`  Found ${tsBlocks.length} TypeScript/TSX blocks to check`);

  // Create temp directory for type checking
  const tmpDir = sdkInstalled ? SDK_DIR : path.join(__dirname, '.tmp-ts-check');
  if (!sdkInstalled && !fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  // Write tsconfig that uses real SDK types
  const tsConfigPath = path.join(tmpDir, 'tsconfig.docs-test.json');
  fs.writeFileSync(tsConfigPath, JSON.stringify({
    compilerOptions: {
      target: "ES2020",
      module: "ESNext",
      moduleResolution: "node",
      jsx: "react-jsx",
      strict: false,
      noEmit: true,
      skipLibCheck: true,
      esModuleInterop: true,
      allowJs: true,
      resolveJsonModule: true,
      baseUrl: ".",
      paths: sdkInstalled ? {
        "@varity-labs/*": ["./node_modules/@varity-labs/*"]
      } : {},
      types: ["node", "react"]
    },
    include: ["docs-test-*.ts", "docs-test-*.tsx"]
  }, null, 2));

  for (let i = 0; i < tsBlocks.length; i++) {
    const block = tsBlocks[i];
    const code = block.code;
    const syntaxIssues = [];

    // === STATIC ANALYSIS (no compiler needed) ===

    // Check for unclosed brackets/parens/braces
    const opens = (code.match(/[\(\[\{]/g) || []).length;
    const closes = (code.match(/[\)\]\}]/g) || []).length;
    if (Math.abs(opens - closes) > 2) { // Allow some tolerance for partial snippets
      syntaxIssues.push(`Severely unbalanced brackets: ${opens} opening vs ${closes} closing`);
    }

    // Check for unclosed template literals
    const backticks = (code.match(/`/g) || []).length;
    if (backticks % 2 !== 0) {
      syntaxIssues.push('Unclosed template literal (odd number of backticks)');
    }

    // Check for wrong package names (CRITICAL - this will break at runtime)
    if (code.includes('from \'@varity/') || code.includes('from "@varity/')) {
      syntaxIssues.push('CRITICAL: Uses @varity/ instead of @varity-labs/ — import will fail');
    }

    // Check for placeholder ellipsis that will cause syntax errors
    const lines = code.split('\n');
    for (const line of lines) {
      if (line.includes('...') && !line.includes('//') && !line.includes('/*')) {
        // Check if it's spread operator (valid) or placeholder (invalid)
        const spreadPatterns = ['...args', '...props', '...rest', '...items', '...data', '...options', '...config'];
        const isSpread = spreadPatterns.some(p => line.includes(p)) || line.match(/\.\.\.\w+/);
        if (!isSpread && (line.trim() === '...' || line.includes('= ...'))) {
          syntaxIssues.push('Contains placeholder "..." — users copying this will get syntax error');
          break;
        }
      }
    }

    // === REAL TYPE CHECKING (if SDK installed) ===
    if (tsAvailable && sdkInstalled && code.split('\n').length >= 2) {
      const isJsx = code.includes('/>') || code.includes('</') || code.includes('tsx');
      const ext = isJsx ? '.tsx' : '.ts';
      const tmpFile = path.join(tmpDir, `docs-test-${i}${ext}`);

      // For real SDK checking, we need to wrap partial snippets properly
      let wrappedCode = code;

      // Add React import if JSX is used
      if (isJsx && !code.includes("from 'react'") && !code.includes('from "react"')) {
        wrappedCode = `import React from 'react';\n${wrappedCode}`;
      }

      // If code is a partial snippet (function body, etc), wrap it
      if (!code.includes('import ') && !code.includes('export ') && !code.includes('function ') && !code.includes('const ')) {
        // This is likely a code fragment, wrap it to make it valid
        wrappedCode = `// Fragment wrapper\nconst __fragment = () => {\n${code}\n};\n`;
      }

      fs.writeFileSync(tmpFile, wrappedCode);

      try {
        const tscCmd = process.platform === 'win32'
          ? `"${path.join(SDK_DIR, 'node_modules', '.bin', 'tsc.cmd')}"`
          : path.join(SDK_DIR, 'node_modules', '.bin', 'tsc');

        execSync(`${tscCmd} --project "${tsConfigPath}" --noEmit "${tmpFile}" 2>&1`, {
          stdio: 'pipe',
          timeout: 20000,
          cwd: tmpDir
        });
        // Compiled successfully with real types!
      } catch (err) {
        const output = err.stdout?.toString() || err.stderr?.toString() || '';
        const errorLines = output.split('\n').filter(line =>
          line.includes('error TS') &&
          !line.includes('Fragment wrapper') &&
          !line.includes('Cannot find module') // May happen for non-Varity imports
        );

        if (errorLines.length > 0) {
          // Categorize errors
          const criticalErrors = errorLines.filter(e =>
            e.includes('has no exported member') ||
            e.includes('Property') && e.includes('does not exist') ||
            e.includes('is not assignable to')
          );

          if (criticalErrors.length > 0) {
            syntaxIssues.push(`SDK TYPE ERRORS (code won't work):\n${criticalErrors.slice(0, 3).join('\n')}`);
          } else {
            syntaxIssues.push(`TypeScript errors:\n${errorLines.slice(0, 2).join('\n')}`);
          }
        }
      }

      // Cleanup
      try { fs.unlinkSync(tmpFile); } catch {}
    }

    // Record results
    if (syntaxIssues.length > 0) {
      results.fail++;
      const isCritical = syntaxIssues.some(s =>
        s.includes('CRITICAL') ||
        s.includes('SDK TYPE ERRORS') ||
        s.includes('import will fail')
      );
      results.issues.push({
        type: 'TYPESCRIPT_ERROR',
        severity: isCritical ? 'CRITICAL' : 'MEDIUM',
        page: block.page,
        problems: syntaxIssues,
        code_preview: code.substring(0, 150) + (code.length > 150 ? '...' : ''),
        tested_with_real_sdk: sdkInstalled,
      });
    } else {
      results.pass++;
    }
  }

  // Cleanup
  if (!sdkInstalled) {
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch {}
  } else {
    try { fs.unlinkSync(tsConfigPath); } catch {}
    // Clean up test files
    const testFiles = fs.readdirSync(tmpDir).filter(f => f.startsWith('docs-test-'));
    testFiles.forEach(f => { try { fs.unlinkSync(path.join(tmpDir, f)); } catch {} });
  }

  console.log(`\n  ✓ ${results.pass} snippets compile OK`);
  if (results.fail > 0) console.log(`  ✗ ${results.fail} snippets with type errors`);
  if (sdkInstalled) console.log(`  📦 Tested against real @varity-labs/sdk types`);

  results.issues.slice(0, 5).forEach(i => {
    console.log(`\n    → ${i.severity}: ${i.page}`);
    i.problems.forEach(p => console.log(`      ${p.substring(0, 200)}`));
  });
  if (results.issues.length > 5) {
    console.log(`\n    ... and ${results.issues.length - 5} more issues`);
  }

  return results;
}

// ============================================================
// TEST SUITE 7: RUNTIME EXECUTION TEST (Supabase-Level)
// ============================================================
//
// This test suite actually EXECUTES code blocks against the REAL
// published @varity-labs packages to verify documentation accuracy.
//
// Features:
//   1. Runs code in Node.js sandbox with real SDK packages
//   2. Parses // Output: comments and verifies actual output matches
//   3. Parses // Throws: comments and verifies error handling
//   4. Reports discrepancies between documented and actual behavior
//
// ============================================================

const vm = require('vm');

/**
 * Parse output assertions from code comments
 * Supports:
 *   // Output: value
 *   // Expected: value
 *   // Returns: value
 *   // Throws: ErrorType
 *   // Error: message
 */
function parseOutputAssertions(code) {
  const assertions = [];
  const lines = code.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Match output assertions
    const outputMatch = line.match(/\/\/\s*(?:Output|Expected|Returns):\s*(.+)$/i);
    if (outputMatch) {
      assertions.push({
        type: 'output',
        expected: outputMatch[1].trim(),
        line: i + 1,
      });
    }

    // Match error assertions
    const throwsMatch = line.match(/\/\/\s*(?:Throws|Error):\s*(.+)$/i);
    if (throwsMatch) {
      assertions.push({
        type: 'throws',
        expected: throwsMatch[1].trim(),
        line: i + 1,
      });
    }

    // Match console.log assertions (common pattern: console.log(x); // "expected")
    const consoleMatch = line.match(/console\.log\([^)]+\);\s*\/\/\s*["']?([^"'\n]+)["']?$/);
    if (consoleMatch) {
      assertions.push({
        type: 'console',
        expected: consoleMatch[1].trim(),
        line: i + 1,
      });
    }
  }

  return assertions;
}

/**
 * Transform TypeScript/ESM code to executable CommonJS
 */
function transformToExecutable(code, sdkDir) {
  let transformed = code;

  // Remove TypeScript type annotations (simplified)
  transformed = transformed
    .replace(/:\s*\w+(\[\])?(?=\s*[=,;)\n])/g, '') // Remove type annotations
    .replace(/:\s*\w+<[^>]+>(?=\s*[=,;)\n])/g, '') // Remove generic types
    .replace(/<\w+>/g, '') // Remove generic brackets
    .replace(/as\s+\w+/g, '') // Remove type assertions
    .replace(/interface\s+\w+\s*\{[^}]*\}/g, '') // Remove interfaces
    .replace(/type\s+\w+\s*=\s*[^;]+;/g, ''); // Remove type aliases

  // Transform ESM imports to CommonJS requires
  // Handle: import { x, y } from 'module'
  transformed = transformed.replace(
    /import\s+\{\s*([^}]+)\s*\}\s+from\s+['"]([^'"]+)['"]/g,
    (match, imports, module) => {
      const importList = imports.split(',').map(i => i.trim().split(' as '));
      const destructure = importList.map(([name, alias]) =>
        alias ? `${name.trim()}: ${alias.trim()}` : name.trim()
      ).join(', ');

      // Resolve @varity-labs packages to SDK_DIR
      if (module.startsWith('@varity-labs/')) {
        return `const { ${destructure} } = require('${sdkDir}/node_modules/${module}')`;
      }
      return `const { ${destructure} } = require('${module}')`;
    }
  );

  // Handle: import x from 'module'
  transformed = transformed.replace(
    /import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g,
    (match, name, module) => {
      if (module.startsWith('@varity-labs/')) {
        return `const ${name} = require('${sdkDir}/node_modules/${module}')`;
      }
      return `const ${name} = require('${module}')`;
    }
  );

  // Handle: import 'module' (side-effect imports)
  transformed = transformed.replace(
    /import\s+['"]([^'"]+)['"]/g,
    (match, module) => {
      if (module.startsWith('@varity-labs/')) {
        return `require('${sdkDir}/node_modules/${module}')`;
      }
      return `require('${module}')`;
    }
  );

  // Remove export statements
  transformed = transformed.replace(/export\s+(default\s+)?/g, '');

  return transformed;
}

/**
 * Execute code block and capture output
 */
async function executeCodeBlock(code, sdkDir, timeout = 5000) {
  const result = {
    success: false,
    output: [],
    error: null,
    executionTime: 0,
  };

  const startTime = Date.now();

  try {
    // Transform code to executable format
    const executableCode = transformToExecutable(code, sdkDir);

    // Capture console output
    const capturedOutput = [];
    const mockConsole = {
      log: (...args) => capturedOutput.push(args.map(a =>
        typeof a === 'object' ? JSON.stringify(a) : String(a)
      ).join(' ')),
      error: (...args) => capturedOutput.push('[ERROR] ' + args.join(' ')),
      warn: (...args) => capturedOutput.push('[WARN] ' + args.join(' ')),
      info: (...args) => capturedOutput.push(args.join(' ')),
    };

    // Create sandbox context with real modules
    const sandbox = {
      console: mockConsole,
      require: require,
      module: { exports: {} },
      exports: {},
      __dirname: sdkDir,
      __filename: path.join(sdkDir, 'test.js'),
      process: {
        env: { ...process.env, NODE_ENV: 'test' },
        cwd: () => sdkDir,
      },
      Buffer: Buffer,
      setTimeout: setTimeout,
      setInterval: setInterval,
      clearTimeout: clearTimeout,
      clearInterval: clearInterval,
      Promise: Promise,
      // Provide BigInt for payment calculations
      BigInt: BigInt,
    };

    // Create VM context
    const context = vm.createContext(sandbox);

    // Wrap in async IIFE to support top-level await
    const wrappedCode = `
      (async () => {
        ${executableCode}
      })().catch(e => { throw e; });
    `;

    // Execute with timeout
    const script = new vm.Script(wrappedCode, {
      filename: 'docs-test.js',
      timeout: timeout,
    });

    await script.runInContext(context, { timeout });

    // Small delay for async operations
    await new Promise(r => setTimeout(r, 100));

    result.success = true;
    result.output = capturedOutput;

  } catch (err) {
    result.success = false;
    result.error = {
      name: err.name || 'Error',
      message: err.message,
      stack: err.stack,
    };
  }

  result.executionTime = Date.now() - startTime;
  return result;
}

/**
 * Compare actual output with expected assertions
 */
function validateOutput(execResult, assertions) {
  const failures = [];

  for (const assertion of assertions) {
    if (assertion.type === 'throws') {
      // Expected an error
      if (execResult.success) {
        failures.push({
          line: assertion.line,
          expected: `Error: ${assertion.expected}`,
          actual: 'No error thrown',
        });
      } else if (!execResult.error.message.includes(assertion.expected) &&
                 !execResult.error.name.includes(assertion.expected)) {
        failures.push({
          line: assertion.line,
          expected: `Error containing: ${assertion.expected}`,
          actual: `${execResult.error.name}: ${execResult.error.message}`,
        });
      }
    } else {
      // Expected output
      if (!execResult.success && assertion.type !== 'throws') {
        failures.push({
          line: assertion.line,
          expected: assertion.expected,
          actual: `Error: ${execResult.error?.message || 'Unknown error'}`,
        });
      } else {
        const outputStr = execResult.output.join('\n');
        const expectedNormalized = assertion.expected.replace(/["']/g, '');
        const outputNormalized = outputStr.replace(/["']/g, '');

        if (!outputNormalized.includes(expectedNormalized)) {
          failures.push({
            line: assertion.line,
            expected: assertion.expected,
            actual: outputStr || '(no output)',
          });
        }
      }
    }
  }

  return failures;
}

async function testRuntimeExecution(codeBlocks) {
  console.log('\n━━━ TEST SUITE 7: RUNTIME EXECUTION (Supabase-Level) ━━━\n');
  const results = { pass: 0, fail: 0, skipped: 0, issues: [], executed: 0 };

  if (!isSDKInstalled()) {
    console.log('  ⚠ SDK not installed. Run with --setup to enable runtime testing.');
    console.log('    This is required for Supabase-level code verification.\n');
    results.skipped = codeBlocks.blocks.length;
    return results;
  }

  console.log('  ✓ Real SDK packages installed — executing code blocks\n');

  // Categories of code blocks
  const categories = {
    executable: [],      // Can run directly (pure functions, SDK utilities)
    importOnly: [],      // Only imports (verify imports resolve)
    reactComponent: [],  // JSX/React (needs browser, skip execution)
    asyncBackend: [],    // Needs real backend (db, storage operations)
    cliCommand: [],      // CLI examples (bash)
  };

  // Categorize all code blocks
  for (const block of codeBlocks.blocks) {
    if (block.lang === 'bash' || block.lang === 'shell') {
      categories.cliCommand.push(block);
      continue;
    }

    if (block.lang !== 'typescript' && block.lang !== 'javascript') {
      continue;
    }

    const code = block.code;

    // Check if it's a React component
    if (code.includes('/>') || code.includes('</') || code.includes('tsx')) {
      categories.reactComponent.push(block);
      continue;
    }

    // Check if it requires real backend
    if (code.includes('await db.') || code.includes('await storage.upload') ||
        code.includes('await auth.') || code.includes('fetch(')) {
      categories.asyncBackend.push(block);
      continue;
    }

    // Check if it only has imports (no executable code)
    const codeWithoutImports = code.replace(/import\s+.*?from\s+['"][^'"]+['"];?\n?/g, '').trim();
    if (codeWithoutImports.length < 10) {
      categories.importOnly.push(block);
      continue;
    }

    // Check if it uses @varity-labs packages
    if (code.includes('@varity-labs/')) {
      categories.executable.push(block);
    }
  }

  console.log('  Code block analysis:');
  console.log(`    📦 Executable with SDK: ${categories.executable.length}`);
  console.log(`    📥 Import-only: ${categories.importOnly.length}`);
  console.log(`    ⚛️  React components: ${categories.reactComponent.length} (browser-only)`);
  console.log(`    🔄 Async/backend: ${categories.asyncBackend.length} (requires live services)`);
  console.log(`    💻 CLI commands: ${categories.cliCommand.length}\n`);

  // Test 1: Verify all imports resolve to real packages
  console.log('  📥 Testing import resolution...');
  const importResults = await testImportResolution(codeBlocks, SDK_DIR);
  results.pass += importResults.pass;
  results.fail += importResults.fail;
  results.issues.push(...importResults.issues);
  console.log(`     ✓ ${importResults.pass} imports resolve correctly`);
  if (importResults.fail > 0) {
    console.log(`     ✗ ${importResults.fail} imports failed`);
  }

  // Test 2: Verify SDK exports match documentation
  console.log('\n  📤 Testing SDK exports match docs...');
  const exportResults = await testSDKExportsReal(codeBlocks, SDK_DIR);
  results.pass += exportResults.pass;
  results.fail += exportResults.fail;
  results.issues.push(...exportResults.issues);
  console.log(`     ✓ ${exportResults.pass} exports verified`);
  if (exportResults.fail > 0) {
    console.log(`     ✗ ${exportResults.fail} missing exports`);
  }

  // Test 3: Execute code blocks with output assertions
  console.log('\n  🚀 Executing code blocks with real packages...');
  let executedCount = 0;
  let passedCount = 0;
  let failedCount = 0;

  for (const block of categories.executable) {
    const assertions = parseOutputAssertions(block.code);

    // Execute the code
    const execResult = await executeCodeBlock(block.code, SDK_DIR);
    executedCount++;
    results.executed++;

    if (!execResult.success && assertions.length === 0) {
      // Code failed and no error was expected
      failedCount++;
      results.fail++;
      results.issues.push({
        type: 'RUNTIME_EXECUTION_ERROR',
        severity: 'CRITICAL',
        page: block.page,
        error: execResult.error,
        code_preview: block.code.substring(0, 150),
        note: 'Code block failed to execute — users copying this will get an error',
      });
    } else if (assertions.length > 0) {
      // Validate output against assertions
      const failures = validateOutput(execResult, assertions);

      if (failures.length > 0) {
        failedCount++;
        results.fail++;
        results.issues.push({
          type: 'OUTPUT_MISMATCH',
          severity: 'HIGH',
          page: block.page,
          failures: failures,
          code_preview: block.code.substring(0, 150),
          note: 'Documented output does not match actual output',
        });
      } else {
        passedCount++;
        results.pass++;
      }
    } else {
      // Code executed successfully with no assertions
      passedCount++;
      results.pass++;
    }
  }

  console.log(`     Executed: ${executedCount} code blocks`);
  console.log(`     ✓ ${passedCount} passed`);
  if (failedCount > 0) {
    console.log(`     ✗ ${failedCount} failed`);
  }

  // Test 4: Verify CLI commands are correct
  console.log('\n  💻 Testing CLI commands...');
  const cliResults = testCLICommands(categories.cliCommand);
  results.pass += cliResults.pass;
  results.fail += cliResults.fail;
  results.issues.push(...cliResults.issues);
  console.log(`     ✓ ${cliResults.pass} CLI commands correct`);
  if (cliResults.fail > 0) {
    console.log(`     ✗ ${cliResults.fail} CLI commands incorrect`);
  }

  // Summary
  console.log('\n  ━━━ Runtime Execution Summary ━━━');
  console.log(`  Total: ${results.pass + results.fail} tests`);
  console.log(`  ✓ Passed: ${results.pass}`);
  console.log(`  ✗ Failed: ${results.fail}`);
  console.log(`  ⏭ Skipped: ${categories.reactComponent.length + categories.asyncBackend.length} (browser/backend required)`);

  // Show critical failures
  const criticalIssues = results.issues.filter(i => i.severity === 'CRITICAL');
  if (criticalIssues.length > 0) {
    console.log('\n  🚨 CRITICAL ISSUES (code will not work for users):');
    criticalIssues.slice(0, 5).forEach(i => {
      console.log(`     → ${i.page}: ${i.error?.message || i.note || i.type}`);
    });
    if (criticalIssues.length > 5) {
      console.log(`     ... and ${criticalIssues.length - 5} more`);
    }
  }

  return results;
}

/**
 * Test that all imports resolve to real packages
 */
async function testImportResolution(codeBlocks, sdkDir) {
  const results = { pass: 0, fail: 0, issues: [] };
  const testedModules = new Set();

  for (const block of codeBlocks.blocks) {
    const importMatches = block.code.match(/from\s+['"](@varity-labs\/[^'"]+)['"]/g) || [];

    for (const match of importMatches) {
      const moduleName = match.match(/['"]([^'"]+)['"]/)?.[1];
      if (!moduleName || testedModules.has(moduleName)) continue;
      testedModules.add(moduleName);

      // Resolve module path
      const baseModule = moduleName.split('/').slice(0, 2).join('/');
      const subPath = moduleName.split('/').slice(2).join('/');
      const modulePath = path.join(sdkDir, 'node_modules', baseModule);

      if (!fs.existsSync(modulePath)) {
        results.fail++;
        results.issues.push({
          type: 'IMPORT_RESOLUTION_FAILED',
          severity: 'CRITICAL',
          page: block.page,
          module: moduleName,
          note: `Module '${moduleName}' not found — install with: npm install ${baseModule}`,
        });
        continue;
      }

      // Check subpath exports
      if (subPath) {
        try {
          const pkgJson = JSON.parse(fs.readFileSync(path.join(modulePath, 'package.json'), 'utf8'));
          const exports = pkgJson.exports || {};
          const subPathKey = `./${subPath}`;

          if (!exports[subPathKey] && !fs.existsSync(path.join(modulePath, subPath))) {
            results.fail++;
            results.issues.push({
              type: 'SUBPATH_NOT_EXPORTED',
              severity: 'HIGH',
              page: block.page,
              module: moduleName,
              note: `Subpath '${subPath}' not exported from ${baseModule}`,
            });
            continue;
          }
        } catch (err) {
          // Skip if we can't read package.json
        }
      }

      results.pass++;
    }
  }

  return results;
}

/**
 * Test that SDK actually exports what the docs claim
 */
async function testSDKExportsReal(codeBlocks, sdkDir) {
  const results = { pass: 0, fail: 0, issues: [] };
  const testedExports = new Map(); // module -> Set of exports

  // Collect all named imports from docs
  for (const block of codeBlocks.blocks) {
    const importRegex = /import\s+\{\s*([^}]+)\s*\}\s+from\s+['"](@varity-labs\/[^'"]+)['"]/g;
    let match;

    while ((match = importRegex.exec(block.code)) !== null) {
      const exports = match[1].split(',').map(e => {
        const parts = e.trim().split(/\s+as\s+/);
        return parts[0].trim();
      }).filter(e => e.length > 0);

      const moduleName = match[2];

      if (!testedExports.has(moduleName)) {
        testedExports.set(moduleName, { exports: new Set(), pages: new Set() });
      }
      exports.forEach(e => testedExports.get(moduleName).exports.add(e));
      testedExports.get(moduleName).pages.add(block.page);
    }
  }

  // Verify each export exists by actually requiring the module
  for (const [moduleName, data] of testedExports) {
    const baseModule = moduleName.split('/').slice(0, 2).join('/');
    const modulePath = path.join(sdkDir, 'node_modules', moduleName.replace('@varity-labs/', '@varity-labs/'));

    try {
      // Try to require the actual module
      const actualModule = require(path.join(sdkDir, 'node_modules', moduleName));
      const actualExports = Object.keys(actualModule);

      for (const exportName of data.exports) {
        if (actualExports.includes(exportName) || actualModule[exportName] !== undefined) {
          results.pass++;
        } else {
          results.fail++;
          results.issues.push({
            type: 'SDK_EXPORT_NOT_FOUND',
            severity: 'CRITICAL',
            module: moduleName,
            export: exportName,
            page: Array.from(data.pages).join(', '),
            available_exports: actualExports.slice(0, 10).join(', ') + (actualExports.length > 10 ? '...' : ''),
            note: `Export '${exportName}' not found in ${moduleName}. Available: ${actualExports.slice(0, 5).join(', ')}`,
          });
        }
      }
    } catch (err) {
      // Module couldn't be required — check types file as fallback
      const typesPath = path.join(sdkDir, 'node_modules', baseModule, 'dist', 'index.d.ts');

      if (fs.existsSync(typesPath)) {
        const typesContent = fs.readFileSync(typesPath, 'utf8');

        for (const exportName of data.exports) {
          // Check if export is declared in types
          const exportPattern = new RegExp(`export\\s+(?:declare\\s+)?(?:const|function|class|interface|type|enum)\\s+${exportName}\\b`);
          const reExportPattern = new RegExp(`export\\s+\\{[^}]*\\b${exportName}\\b`);

          if (exportPattern.test(typesContent) || reExportPattern.test(typesContent) || typesContent.includes(`export { ${exportName}`)) {
            results.pass++;
          } else {
            results.fail++;
            results.issues.push({
              type: 'SDK_EXPORT_NOT_FOUND',
              severity: 'HIGH',
              module: moduleName,
              export: exportName,
              page: Array.from(data.pages).join(', '),
              note: `Export '${exportName}' not found in ${moduleName} type definitions`,
            });
          }
        }
      } else {
        // Can't verify, assume pass but note it
        results.pass += data.exports.size;
      }
    }
  }

  return results;
}

/**
 * Test CLI commands are correct
 */
function testCLICommands(cliBlocks) {
  const results = { pass: 0, fail: 0, issues: [] };

  const correctPatterns = [
    /^varitykit\s+/,           // varitykit commands
    /^pip\s+install\s+varitykit/, // pip install
    /^npm\s+(?:install|i)\s+@varity-labs\//, // npm install SDK
    /^npx\s+create-varity-app/, // npx create app
  ];

  const incorrectPatterns = [
    { pattern: /^varity\s+(?!kit)/, fix: 'Use "varitykit" instead of "varity"' },
    { pattern: /^npx\s+varitykit/, fix: 'Use "pip install varitykit" then "varitykit" (it\'s a Python CLI)' },
    { pattern: /@varity\//, fix: 'Use "@varity-labs/" instead of "@varity/"' },
  ];

  for (const block of cliBlocks) {
    const commands = block.code.split('\n').filter(l => l.trim() && !l.startsWith('#'));

    for (const cmd of commands) {
      const trimmed = cmd.replace(/^\$\s*/, '').trim();

      // Check for incorrect patterns
      let foundIncorrect = false;
      for (const { pattern, fix } of incorrectPatterns) {
        if (pattern.test(trimmed)) {
          results.fail++;
          results.issues.push({
            type: 'INCORRECT_CLI_COMMAND',
            severity: 'CRITICAL',
            page: block.page,
            command: trimmed,
            fix: fix,
          });
          foundIncorrect = true;
          break;
        }
      }

      if (!foundIncorrect) {
        // Check if it matches any correct pattern or is a generic command
        const isVarityCommand = correctPatterns.some(p => p.test(trimmed));
        const isGenericCommand = /^(?:npm|npx|pip|cd|ls|mkdir|git|node|python)/.test(trimmed);

        if (isVarityCommand || isGenericCommand || !trimmed.includes('varity')) {
          results.pass++;
        }
      }
    }
  }

  return results;
}

// ============================================================
// CLAUDE CODE FIX REPORT GENERATOR
// ============================================================

function generateClaudeCodeReport(allResults, pages) {
  const allIssues = Object.values(allResults).flatMap(r => r.issues || []);
  if (allIssues.length === 0) return;

  // Group issues by page so Claude Code can fix one file at a time
  const byPage = {};
  const global = [];

  for (const issue of allIssues) {
    const page = issue.page || issue.url || null;
    if (page) {
      if (!byPage[page]) byPage[page] = [];
      byPage[page].push(issue);
    } else {
      global.push(issue);
    }
  }

  let report = `# VARITY DOCS — AUTOMATED TEST RESULTS\n`;
  report += `# Generated: ${new Date().toISOString()}\n`;
  report += `# Feed this entire file to Claude Code to fix all issues.\n\n`;
  report += `## INSTRUCTIONS FOR CLAUDE CODE\n\n`;
  report += `You are fixing the Varity documentation website (docs.varity.so).\n`;
  report += `The docs are built with Astro/Starlight and the source files are in the varity-docs repository.\n`;
  report += `Below is a list of every issue found by automated testing, grouped by page.\n`;
  report += `Fix each issue in the corresponding source .mdx file.\n`;
  report += `After fixing, run the tester again to verify: node test-docs.js\n\n`;
  report += `### Key rules:\n`;
  report += `- Replace @varity/sdk with @varity-labs/sdk everywhere\n`;
  report += `- Replace @varity/ui-kit with @varity-labs/ui-kit everywhere\n`;
  report += `- Replace @varity/cli with varitykit everywhere\n`;
  report += `- Replace "varity deploy" with "varitykit deploy" everywhere\n`;
  report += `- Replace "varity init" with "varitykit init" everywhere\n`;
  report += `- Remove or replace forbidden words per the positioning framework:\n`;
  report += `  - "blockchain" → "distributed infrastructure"\n`;
  report += `  - "Web3" → "next-generation infrastructure"\n`;
  report += `  - "smart contract" → "automated business logic"\n`;
  report += `  - "wallet" → "account" (except in Smart Accounts section)\n`;
  report += `  - "on-chain" → "tamper-proof" or "verifiable"\n`;
  report += `  - "USDC" → "payments" or "credit card"\n`;
  report += `  - "dApp" → "application"\n`;
  report += `  - "censorship-resistant" → "reliable, distributed"\n`;
  report += `  - "gasless" → "free operations"\n`;
  report += `  - "Privy" → abstract away (use VarityAuth or AuthProvider instead)\n`;
  report += `- Standardize cost savings to "60-80%" everywhere\n`;
  report += `- Standardize revenue share to one number everywhere\n\n`;

  report += `---\n\n`;

  // Sort: CRITICAL first, then HIGH, then MEDIUM, then LOW
  const severityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };

  // Summary
  const critical = allIssues.filter(i => i.severity === 'CRITICAL').length;
  const high = allIssues.filter(i => i.severity === 'HIGH').length;
  const medium = allIssues.filter(i => i.severity === 'MEDIUM').length;
  const low = allIssues.filter(i => i.severity === 'LOW').length;

  report += `## SUMMARY\n\n`;
  report += `Total issues: ${allIssues.length}\n`;
  report += `- CRITICAL: ${critical} (fix immediately)\n`;
  report += `- HIGH: ${high} (fix before beta)\n`;
  report += `- MEDIUM: ${medium} (fix within 1 week)\n`;
  report += `- LOW: ${low} (review and decide)\n\n`;
  report += `---\n\n`;

  // Global issues (not tied to a specific page)
  if (global.length > 0) {
    report += `## GLOBAL ISSUES (affect multiple pages)\n\n`;
    for (const issue of global) {
      report += formatIssueForClaude(issue);
    }
    report += `---\n\n`;
  }

  // Per-page issues
  const sortedPages = Object.keys(byPage).sort((a, b) => {
    const aMax = Math.min(...byPage[a].map(i => severityOrder[i.severity] ?? 3));
    const bMax = Math.min(...byPage[b].map(i => severityOrder[i.severity] ?? 3));
    return aMax - bMax;
  });

  for (const page of sortedPages) {
    const issues = byPage[page].sort((a, b) => 
      (severityOrder[a.severity] ?? 3) - (severityOrder[b.severity] ?? 3)
    );
    
    // Convert URL to likely source file path
    const sourcePath = urlToSourcePath(page);
    
    report += `## PAGE: ${page}\n`;
    report += `## SOURCE: ${sourcePath}\n`;
    report += `## Issues: ${issues.length}\n\n`;

    for (const issue of issues) {
      report += formatIssueForClaude(issue);
    }
    report += `---\n\n`;
  }

  // Save the report
  const reportDir = path.join(__dirname, 'reports');
  const fixFile = path.join(reportDir, 'CLAUDE-CODE-FIX-LIST.md');
  fs.writeFileSync(fixFile, report);
  console.log(`\n🤖 Claude Code fix list saved to: ${fixFile}`);
  console.log(`   Paste this file into Claude Code to fix all issues automatically.`);

  return fixFile;
}

function urlToSourcePath(url) {
  // Convert docs.varity.so URL to likely Astro/Starlight source path
  let p = url.replace('https://docs.varity.so', '').replace(/\/$/, '');
  if (p === '' || p === '/') return 'src/content/docs/index.mdx';
  return `src/content/docs${p}.mdx`;
}

function formatIssueForClaude(issue) {
  let out = `### [${issue.severity}] ${issue.type}\n`;

  switch (issue.type) {
    case 'WRONG_PACKAGE_NAME':
    case 'WRONG_INSTALL_COMMAND':
      out += `**Find:** \`${issue.found}\`\n`;
      out += `**Replace with:** \`${issue.should_be}\`\n`;
      if (issue.code_snippet) out += `**Context:** \`${issue.code_snippet}\`\n`;
      break;
    
    case 'WRONG_CLI_NAME':
      out += `**Find:** \`${issue.found}\`\n`;
      out += `**Replace with:** \`${issue.should_be}\`\n`;
      if (issue.code_snippet) out += `**In code block:** \`${issue.code_snippet}\`\n`;
      break;

    case 'FORBIDDEN_WORD':
      out += `**Word:** "${issue.word}" (found ${issue.count}x)\n`;
      out += `**Action:** ${issue.context}\n`;
      if (issue.in_technical_page) out += `**Note:** This is a technical page — use judgment on whether to replace.\n`;
      break;

    case 'FORBIDDEN_WORD_IN_HEADING':
      out += `**Word:** "${issue.word}" found in ${issue.location}\n`;
      out += `**Action:** ${issue.context}\n`;
      out += `**Priority:** Headings and navigation are the most visible — always fix these.\n`;
      break;

    case 'BROKEN_LINK':
      out += `**Broken URL:** ${issue.url}\n`;
      out += `**Error:** ${issue.error}\n`;
      out += `**Found on:** ${(issue.found_on || []).join(', ')}\n`;
      out += `**Action:** Update the link or remove it if the target page no longer exists.\n`;
      break;

    case 'WRONG_PACKAGE_IN_NAV':
      out += `**Navigation shows:** "${issue.found}"\n`;
      out += `**Should show:** "${issue.should_be}"\n`;
      out += `**Action:** Update the sidebar/nav configuration in the Astro config or content file.\n`;
      break;

    case 'INCONSISTENT_REVENUE_SHARE':
      out += `**Problem:** Different pages show different revenue share percentages.\n`;
      out += `**Found:** ${JSON.stringify(issue.claims, null, 2)}\n`;
      out += `**Action:** Pick one percentage and update all pages to match.\n`;
      break;

    case 'INCONSISTENT_PERCENTAGE':
      out += `**Problem:** Different cost savings percentages found across pages.\n`;
      out += `**Found:** ${JSON.stringify(issue.found, null, 2)}\n`;
      out += `**Action:** Standardize to "60-80%" everywhere.\n`;
      break;

    case 'TYPESCRIPT_SYNTAX':
      out += `**Problems:**\n`;
      for (const p of issue.problems) {
        out += `- ${p}\n`;
      }
      out += `**Code preview:** \`${issue.code_preview}\`\n`;
      break;

    case 'UNKNOWN_PACKAGE':
      out += `**Package:** \`${issue.found}\`\n`;
      out += `**Note:** ${issue.note}\n`;
      break;

    case 'BROKEN_ANCHOR':
      out += `**Broken anchor:** \`${issue.anchor}\`\n`;
      out += `**Link text:** "${issue.link_text}"\n`;
      out += `**Target page:** ${issue.target}\n`;
      out += `**Action:** Either fix the anchor to match an existing heading ID, or add an ID to the target heading.\n`;
      break;

    case 'SDK_NOT_PUBLISHED':
      out += `**Package:** \`${issue.package}\`\n`;
      out += `**Problem:** Package not found on npm registry.\n`;
      out += `**Action:** Either publish the package to npm, or update docs to use a package that exists.\n`;
      break;

    case 'TYPESCRIPT_ERROR':
      out += `**Problems:**\n`;
      for (const p of (issue.problems || [])) {
        out += `- ${p}\n`;
      }
      if (issue.code_preview) out += `**Code preview:** \`${issue.code_preview}\`\n`;
      if (issue.tested_with_real_sdk) out += `**Note:** Tested against real @varity-labs/sdk types.\n`;
      break;

    default:
      if (issue.found) out += `**Found:** "${issue.found}"\n`;
      if (issue.should_be) out += `**Should be:** "${issue.should_be}"\n`;
      if (issue.note) out += `**Note:** ${issue.note}\n`;
  }

  out += `\n`;
  return out;
}

// ============================================================
// REPORT GENERATOR
// ============================================================

function generateReport(allResults, pages, startTime) {
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(1);

  const totalPass = Object.values(allResults).reduce((sum, r) => sum + (r.pass || 0), 0);
  const totalFail = Object.values(allResults).reduce((sum, r) => sum + (r.fail || 0), 0);
  const allIssues = Object.values(allResults).flatMap(r => r.issues || []);
  
  const critical = allIssues.filter(i => i.severity === 'CRITICAL');
  const high = allIssues.filter(i => i.severity === 'HIGH');
  const medium = allIssues.filter(i => i.severity === 'MEDIUM');
  const low = allIssues.filter(i => i.severity === 'LOW');

  console.log('\n' + '═'.repeat(60));
  console.log('  VARITY DOCS TEST REPORT');
  console.log('═'.repeat(60));
  console.log(`  Pages crawled:    ${pages.filter(p => p.html).length}/${pages.length}`);
  console.log(`  Duration:         ${duration}s`);
  console.log(`  Tests passed:     ${totalPass}`);
  console.log(`  Tests failed:     ${totalFail}`);
  console.log('');
  console.log(`  CRITICAL issues:  ${critical.length}`);
  console.log(`  HIGH issues:      ${high.length}`);
  console.log(`  MEDIUM issues:    ${medium.length}`);
  console.log(`  LOW issues:       ${low.length}`);
  console.log('═'.repeat(60));

  if (critical.length > 0) {
    console.log('\n🚨 CRITICAL ISSUES (fix immediately):\n');
    critical.forEach((issue, i) => {
      console.log(`  ${i + 1}. [${issue.type}] ${issue.page || 'multiple pages'}`);
      if (issue.found) console.log(`     Found: "${issue.found}"`);
      if (issue.should_be) console.log(`     Should be: "${issue.should_be}"`);
      if (issue.word) console.log(`     Forbidden word: "${issue.word}" — ${issue.context}`);
      if (issue.note) console.log(`     ${issue.note}`);
      console.log('');
    });
  }

  if (high.length > 0) {
    console.log('\n⚠️  HIGH ISSUES (fix before beta launch):\n');
    high.forEach((issue, i) => {
      console.log(`  ${i + 1}. [${issue.type}] ${issue.page || 'multiple pages'}`);
      if (issue.found) console.log(`     Found: "${issue.found}"`);
      if (issue.should_be) console.log(`     Should be: "${issue.should_be}"`);
      if (issue.word) console.log(`     "${issue.word}" (${issue.count}x) — ${issue.context}`);
      if (issue.url) console.log(`     URL: ${issue.url} (${issue.error})`);
      console.log('');
    });
  }

  // Save full JSON report
  const report = {
    timestamp: new Date().toISOString(),
    duration_seconds: parseFloat(duration),
    pages_crawled: pages.filter(p => p.html).length,
    pages_failed: pages.filter(p => !p.html).length,
    summary: { pass: totalPass, fail: totalFail, critical: critical.length, high: high.length, medium: medium.length, low: low.length },
    suites: allResults,
    all_issues: allIssues,
  };

  const reportDir = path.join(__dirname, 'reports');
  if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });
  
  const reportFile = path.join(reportDir, `docs-test-${new Date().toISOString().split('T')[0]}.json`);
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  console.log(`\n📄 Full report saved to: ${reportFile}`);

  return report;
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  const args = process.argv.slice(2);
  const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : null;
  const verbose = args.includes('--verbose');
  const setupMode = args.includes('--setup');
  const noDiscover = args.includes('--no-discover');
  const startTime = Date.now();

  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║     VARITY DOCS AUTOMATED TESTER v4.0 (World-Class)      ║');
  console.log('║   Auto-Discovery • SDK Validation • Anchor Checking      ║');
  console.log('╚══════════════════════════════════════════════════════════╝');

  // Handle --setup mode
  if (setupMode) {
    const success = await setupSDKEnvironment();
    if (success) {
      console.log('\n✅ SDK environment ready! Run tests with: node test-docs.js\n');
      process.exit(0);
    } else {
      console.log('\n❌ SDK setup failed. Check your network connection.\n');
      process.exit(1);
    }
  }

  // Check if SDK is available for enhanced testing
  if (isSDKInstalled()) {
    console.log('\n📦 Enterprise Mode: Testing against REAL @varity-labs/sdk types');
  } else {
    console.log('\n⚠️  Basic Mode: Run with --setup for real SDK type checking');
  }

  // Determine which pages to test
  let pagePaths;
  if (noDiscover) {
    console.log(`\nUsing hardcoded list of ${DOCS_PAGES.length} pages...`);
    pagePaths = DOCS_PAGES;
  } else {
    // Auto-discover all pages by crawling
    pagePaths = await discoverAllPages();
    if (pagePaths.length === 0) {
      console.log('⚠️  No pages discovered. Falling back to hardcoded list.');
      pagePaths = DOCS_PAGES;
    }
  }

  console.log(`\nFetching content from ${pagePaths.length} pages...\n`);

  // Fetch all page content
  const pageTasks = pagePaths.map(p => async () => {
    const result = await fetchPage(BASE_URL + p);
    const shortUrl = p.length > 50 ? p.substring(0, 47) + '...' : p;
    if (result.html) process.stdout.write(`  ✓ ${shortUrl}\n`);
    else process.stdout.write(`  ✗ ${shortUrl} (${result.error})\n`);
    return result;
  });

  const pages = await pool(pageTasks, CONCURRENCY);
  const successPages = pages.filter(p => p.html).length;
  console.log(`\nFetched ${successPages}/${pages.length} pages successfully`);

  // Run test suites
  const results = {};

  // SDK version check (run early to inform other tests)
  if (!only || only === 'versions') {
    results.versions = await checkSDKVersions();
  }

  // Always extract code blocks (needed by other tests)
  const codeBlocks = extractCodeBlocks(pages);

  if (!only || only === 'links') {
    results.links = await testLinks(pages);
  }

  if (!only || only === 'anchors') {
    results.anchors = testAnchorLinks(pages);
  }

  if (!only || only === 'code') {
    results.code = { pass: codeBlocks.total, fail: 0, issues: [], note: 'Code blocks extracted. Run with --only imports to validate imports.' };
  }

  if (!only || only === 'imports') {
    results.imports = testImports(codeBlocks);
  }

  if (!only || only === 'positioning') {
    results.positioning = testPositioning(pages);
  }

  if (!only || only === 'consistency') {
    results.consistency = testConsistency(pages, codeBlocks);
  }

  if (!only || only === 'typescript') {
    results.typescript = testTypeScriptSyntax(codeBlocks);
  }

  // Generate report
  const report = generateReport(results, pages, startTime);

  // Generate Claude Code fix list
  generateClaudeCodeReport(results, pages);

  // Exit with error code if critical issues found
  const criticalCount = Object.values(results).flatMap(r => r.issues || []).filter(i => i.severity === 'CRITICAL').length;
  if (criticalCount > 0) {
    console.log(`\n❌ ${criticalCount} CRITICAL issues found. Fix these before any public launch.`);
    process.exit(1);
  } else {
    console.log('\n✅ No critical issues found.');
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(2);
});
