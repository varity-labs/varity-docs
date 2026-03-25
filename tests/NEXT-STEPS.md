# Varity Docs Tester - URGENT Next Steps

**Last Updated**: March 24, 2026
**Priority**: HIGH - Beta testers starting soon
**Goal**: World-class docs testing like Supabase (NO MOCKS)

---

## Current Status

### What's Working ✅
- Auto-discovery of all docs pages
- Link checking (internal + external)
- Anchor validation (#section links)
- Code block extraction
- Import validation (catches @varity/ vs @varity-labs/)
- Positioning compliance (forbidden words)
- Consistency checking
- Basic TypeScript syntax checking

### What Needs Fixing 🔧

1. **SDK Installation is Broken**
   - `.sdk-test-env/node_modules/@varity-labs/sdk/` is missing `package.json`
   - Need to reinstall with: `npm install @varity-labs/sdk@latest --force`

2. **Runtime Execution Tests (Suite 7) - NOT WORKING**
   - Code exists but doesn't actually execute against real packages
   - Need to verify SDK exports match documentation

3. **CLI Testing - MISSING**
   - `varitykit` (PyPI) CLI not tested at all
   - `create-varity-app` (npm) not tested
   - Should verify all CLI commands work

4. **MCP Package Testing - MISSING**
   - `@varity-labs/mcp` not verified

---

## ALL Published Packages (MUST TEST ALL)

### NPM Packages (5 total) — Verified from npm registry

| Package | Version | Source Repo | Description |
|---------|---------|-------------|-------------|
| `@varity-labs/sdk` | 2.0.0-beta.6 | varity-sdk/packages/core | Core SDK - auth, database, storage, analytics |
| `@varity-labs/ui-kit` | 2.0.0-beta.7 | varity-sdk/packages/ui | 19 React components - auth, payments, dashboard |
| `@varity-labs/types` | 2.0.0-beta.4 | varity-sdk/packages/types | TypeScript type definitions |
| `@varity-labs/mcp` | 1.3.2 | varity-mcp | MCP Server for AI tools (Cursor, Claude, Windsurf) |
| `create-varity-app` | 2.0.0-beta.9 | varity-sdk/cli | CLI to scaffold new apps (`npx create-varity-app`) |

### PyPI Package (1 total) — Verified from PyPI

| Package | Version | Source Repo | Description |
|---------|---------|-------------|-------------|
| `varitykit` | 1.1.13 | varity-sdk/cli | Python CLI - init, deploy, doctor, dev commands |

### varitykit CLI Commands (from PyPI)
```
varitykit doctor      → Validates environment (Node, Python, Git, npm)
varitykit init        → Scaffolds new apps from templates
varitykit app deploy  → Deploys to production
varitykit app list    → Lists all deployments
varitykit dev         → Starts local dev server
varitykit completions → Shell tab completion
```

### @varity-labs/sdk Subpath Exports (from package.json exports field)
```
@varity-labs/sdk              → Main entry (VarityProvider, useAuth, etc.)
@varity-labs/sdk/aa           → Account abstraction
@varity-labs/sdk/chains       → Chain configurations
@varity-labs/sdk/thirdweb     → Thirdweb integration
@varity-labs/sdk/tracking     → Analytics/tracking
@varity-labs/sdk/contracts    → Contract interactions
@varity-labs/sdk/blockchain   → Blockchain utilities
@varity-labs/sdk/orchestration → Workflow orchestration
```

### GitHub Container Packages (Docker images)
```
ghcr.io/varity-labs/varity-gateway    → API Gateway
ghcr.io/varity-labs/varity-auth       → Auth service
ghcr.io/varity-labs/credential-proxy  → Credential management
ghcr.io/varity-labs/db-proxy          → Database proxy
ghcr.io/varity-labs/varity-mcp        → MCP server container
```

### Source Code & Registry References

**GitHub Organization**: https://github.com/orgs/varity-labs/repositories

| Repository | Description | Packages Published |
|------------|-------------|-------------------|
| `varity-labs/varity-sdk` | **Main Monorepo** (TypeScript + Python) | @varity-labs/sdk, @varity-labs/ui-kit, @varity-labs/types, create-varity-app, varitykit |
| `varity-labs/varity-mcp` | MCP Server for AI tools | @varity-labs/mcp |
| `varity-labs/varity-docs` | Documentation site (MDX) | — |
| `varity-labs/varity-saas-template` | Production SaaS starter | — |
| `varity-labs/marketing-website` | varity.so website | — |

**Monorepo Structure** (`varity-labs/varity-sdk`):
```
varity-sdk/
├── packages/
│   ├── core/varity-sdk/       → @varity-labs/sdk
│   ├── ui/varity-ui-kit/      → @varity-labs/ui-kit
│   └── types/                 → @varity-labs/types
├── cli/                       → varitykit (PyPI) + create-varity-app (npm)
├── services/                  → Backend services
└── templates/saas-starter/    → Template used by create-varity-app
```

**Registry Links**:
- npm: https://www.npmjs.com/search?q=%40varity-labs
- PyPI: https://pypi.org/project/varitykit/
- GitHub Packages (containers): https://github.com/orgs/varity-labs/packages

---

## Quick Fix Commands

```bash
# 1. Clean and reinstall SDK test environment (ALL 5 npm packages)
cd tests
rm -rf .sdk-test-env
mkdir .sdk-test-env
cd .sdk-test-env
npm init -y
npm install @varity-labs/sdk@latest @varity-labs/ui-kit@latest @varity-labs/types@latest @varity-labs/mcp@latest typescript@5 @types/node@20 @types/react@18 --legacy-peer-deps

# 2. Install varitykit CLI (PyPI)
pip install varitykit --upgrade

# 3. Test that ALL packages work
node -e "const sdk = require('@varity-labs/sdk'); console.log('SDK:', Object.keys(sdk))"
node -e "const ui = require('@varity-labs/ui-kit'); console.log('UI-Kit:', Object.keys(ui))"
node -e "const types = require('@varity-labs/types'); console.log('Types:', Object.keys(types))"
node -e "const mcp = require('@varity-labs/mcp'); console.log('MCP:', Object.keys(mcp))"
npx create-varity-app --help
varitykit --help
varitykit doctor

# 4. Run full test suite
cd ..
node test-docs.cjs
```

---

## What to Build Next (Priority Order)

### 1. Test ALL 5 NPM Packages (45 min)

```javascript
// Add to test-docs.cjs as TEST SUITE 8: REAL PACKAGE VERIFICATION
// This tests against the ACTUAL published packages on npm

async function testAllNpmPackages() {
  console.log('\n━━━ TEST SUITE 8: REAL NPM PACKAGE VERIFICATION ━━━\n');
  console.log('  Testing against packages from: https://github.com/varity-labs/varity-sdk\n');
  const results = { pass: 0, fail: 0, issues: [] };

  // All 5 npm packages with expected exports (based on docs)
  const packages = [
    {
      name: '@varity-labs/sdk',
      version: '2.0.0-beta.6',
      repo: 'varity-sdk/packages/core',
      expectedExports: ['VarityProvider', 'useAuth', 'useUser', 'useDatabase']
    },
    {
      name: '@varity-labs/ui-kit',
      version: '2.0.0-beta.7',
      repo: 'varity-sdk/packages/ui',
      expectedExports: ['Button', 'AuthButton', 'LoginButton', 'UserProfile']
    },
    {
      name: '@varity-labs/types',
      version: '2.0.0-beta.4',
      repo: 'varity-sdk/packages/types',
      expectedExports: [] // Types package - just verify it loads
    },
    {
      name: '@varity-labs/mcp',
      version: '1.3.2',
      repo: 'varity-mcp',
      expectedExports: [] // MCP server - verify it loads
    },
  ];

  for (const pkg of packages) {
    try {
      const mod = require(path.join(SDK_DIR, 'node_modules', pkg.name));
      const actualExports = Object.keys(mod);
      console.log(`  ✓ ${pkg.name}@${pkg.version} loaded (${actualExports.length} exports)`);
      console.log(`    Exports: ${actualExports.slice(0, 8).join(', ')}${actualExports.length > 8 ? '...' : ''}`);
      results.pass++;

      // Verify expected exports exist (these should match what docs show)
      for (const exp of pkg.expectedExports) {
        if (mod[exp] !== undefined) {
          results.pass++;
        } else {
          results.fail++;
          results.issues.push({
            type: 'DOCS_EXPORT_NOT_IN_PACKAGE',
            severity: 'CRITICAL',
            package: pkg.name,
            export: exp,
            available: actualExports.slice(0, 15).join(', '),
            note: `Docs claim "${exp}" exists but package doesn't export it`
          });
          console.log(`    ✗ Missing export: ${exp}`);
        }
      }
    } catch (err) {
      results.fail++;
      results.issues.push({
        type: 'PACKAGE_LOAD_FAILED',
        severity: 'CRITICAL',
        package: pkg.name,
        error: err.message,
        note: `Users running "npm install ${pkg.name}" will get broken code`
      });
      console.log(`  ✗ ${pkg.name} FAILED: ${err.message}`);
    }
  }

  // Test SDK subpaths (these are documented in the docs)
  console.log('\n  Testing @varity-labs/sdk subpath exports...');
  const subpaths = ['chains', 'aa', 'thirdweb', 'tracking', 'contracts', 'blockchain', 'orchestration'];
  for (const sub of subpaths) {
    try {
      const subMod = require(path.join(SDK_DIR, 'node_modules/@varity-labs/sdk', sub));
      const subExports = Object.keys(subMod);
      console.log(`  ✓ @varity-labs/sdk/${sub} (${subExports.length} exports)`);
      results.pass++;
    } catch (err) {
      results.fail++;
      results.issues.push({
        type: 'SUBPATH_NOT_EXPORTED',
        severity: 'HIGH',
        subpath: `@varity-labs/sdk/${sub}`,
        error: err.message,
        note: `Docs show "import { ... } from '@varity-labs/sdk/${sub}'" but it doesn't work`
      });
      console.log(`  ✗ @varity-labs/sdk/${sub} FAILED`);
    }
  }

  return results;
}
```

### 2. Test varitykit CLI (PyPI) (30 min)

```javascript
// Add to test-docs.cjs as TEST SUITE 9: VARITYKIT CLI VERIFICATION

async function testVaritykitCLI() {
  console.log('\n━━━ TEST SUITE 9: VARITYKIT CLI (PyPI) ━━━\n');
  const results = { pass: 0, fail: 0, issues: [] };

  const commands = [
    { cmd: 'varitykit --version', expect: /\d+\.\d+\.\d+/ },
    { cmd: 'varitykit --help', expect: /doctor|init|deploy/ },
    { cmd: 'varitykit doctor --help', expect: /environment|check/ },
    { cmd: 'varitykit init --help', expect: /template|scaffold/ },
  ];

  for (const { cmd, expect } of commands) {
    try {
      const output = execSync(cmd, { encoding: 'utf8', timeout: 30000 });
      if (expect.test(output)) {
        console.log(`  ✓ ${cmd}`);
        results.pass++;
      } else {
        console.log(`  ⚠ ${cmd} — unexpected output`);
        results.fail++;
        results.issues.push({
          type: 'CLI_UNEXPECTED_OUTPUT',
          severity: 'MEDIUM',
          command: cmd,
          output: output.substring(0, 200)
        });
      }
    } catch (err) {
      results.fail++;
      results.issues.push({
        type: 'CLI_COMMAND_FAILED',
        severity: 'CRITICAL',
        command: cmd,
        error: err.message
      });
      console.log(`  ✗ ${cmd} FAILED`);
    }
  }

  return results;
}
```

### 3. Test create-varity-app CLI (npm) (20 min)

```javascript
async function testCreateVarityApp() {
  console.log('\n━━━ TEST SUITE 10: CREATE-VARITY-APP CLI ━━━\n');
  const results = { pass: 0, fail: 0, issues: [] };

  try {
    const output = execSync('npx create-varity-app --help', {
      encoding: 'utf8',
      timeout: 60000
    });

    if (output.includes('create-varity-app') || output.includes('Usage')) {
      console.log('  ✓ npx create-varity-app --help works');
      results.pass++;
    }

    // Verify it shows template options
    if (output.includes('template') || output.includes('starter')) {
      console.log('  ✓ Shows template options');
      results.pass++;
    }
  } catch (err) {
    results.fail++;
    results.issues.push({
      type: 'CREATE_APP_FAILED',
      severity: 'CRITICAL',
      error: err.message
    });
  }

  return results;
}
```

### 4. Verify Docs Match Real Exports (30 min)

```javascript
// Cross-reference every import statement in docs against real package exports
async function verifyDocsMatchRealExports(codeBlocks) {
  console.log('\n━━━ TEST SUITE 11: DOCS vs REAL EXPORTS ━━━\n');
  const results = { pass: 0, fail: 0, issues: [] };

  // Load real packages
  const realExports = {};
  try {
    realExports['@varity-labs/sdk'] = Object.keys(require(path.join(SDK_DIR, 'node_modules/@varity-labs/sdk')));
    realExports['@varity-labs/ui-kit'] = Object.keys(require(path.join(SDK_DIR, 'node_modules/@varity-labs/ui-kit')));
    realExports['@varity-labs/types'] = Object.keys(require(path.join(SDK_DIR, 'node_modules/@varity-labs/types')));
  } catch (e) {
    console.log('  ⚠ Could not load packages for verification');
    return results;
  }

  // Extract all named imports from docs
  const importRegex = /import\s+\{\s*([^}]+)\s*\}\s+from\s+['"](@varity-labs\/[^'"]+)['"]/g;

  for (const block of codeBlocks.blocks) {
    let match;
    while ((match = importRegex.exec(block.code)) !== null) {
      const imports = match[1].split(',').map(i => i.trim().split(' as ')[0].trim());
      const pkg = match[2];

      if (realExports[pkg]) {
        for (const imp of imports) {
          if (realExports[pkg].includes(imp)) {
            results.pass++;
          } else {
            results.fail++;
            results.issues.push({
              type: 'DOCS_IMPORT_NOT_IN_PACKAGE',
              severity: 'CRITICAL',
              page: block.page,
              import: imp,
              package: pkg,
              note: `Docs show "import { ${imp} }" but ${pkg} doesn't export it`
            });
          }
        }
      }
    }
  }

  console.log(`  ✓ ${results.pass} imports verified against real packages`);
  if (results.fail > 0) {
    console.log(`  ✗ ${results.fail} imports don't exist in real packages`);
  }

  return results;
}
```

---

## Varity Positioning Context

**Tagline**: "Shopify for Business Apps"

**Target Audiences**:
1. **Consulting firms/Agencies** - Building custom apps for enterprise clients
2. **Developers** - Building SaaS and business applications

**Key Value Props**:
- 70-85% infrastructure cost savings
- Auth, database, storage, payments built-in
- Deploy in minutes, not months
- No blockchain/Web3 jargon (invisible infrastructure)

**Forbidden Words in Docs**:
- blockchain, web3, smart contract, on-chain
- wallet (use "account"), dApp (use "app")
- gas fees, USDC, token (crypto context)
- Privy (internal implementation detail)

---

## File Reference

```
tests/
├── test-docs.cjs          # Main test file (2200 lines)
├── NEXT-STEPS.md          # THIS FILE
├── README.md              # Documentation
├── .sdk-test-env/         # SDK packages (needs reinstall)
├── mocks/                 # SHOULD BE EMPTY (no mocks!)
└── reports/
    ├── docs-test-*.json   # Test results
    └── CLAUDE-CODE-FIX-LIST.md  # Auto-fix instructions
```

---

## When You Return (Step-by-Step)

### Step 1: Install ALL packages (5 min)
```bash
cd tests
rm -rf .sdk-test-env
node test-docs.cjs --setup
pip install varitykit --upgrade
```

### Step 2: Verify packages installed correctly (2 min)
```bash
cd .sdk-test-env
node -e "console.log(Object.keys(require('@varity-labs/sdk')))"
node -e "console.log(Object.keys(require('@varity-labs/ui-kit')))"
varitykit --version
npx create-varity-app --help
```

### Step 3: Run current tests (5 min)
```bash
cd ..
node test-docs.cjs
```

### Step 4: Add the new test suites (30-45 min)
Copy the test functions from "What to Build Next" section above into test-docs.cjs:
- TEST SUITE 8: testAllNpmPackages()
- TEST SUITE 9: testVaritykitCLI()
- TEST SUITE 10: testCreateVarityApp()
- TEST SUITE 11: verifyDocsMatchRealExports()

### Step 5: Wire up new tests in main() (10 min)
Add to the main() function:
```javascript
if (!only || only === 'packages') {
  results.packages = await testAllNpmPackages();
}
if (!only || only === 'varitykit') {
  results.varitykit = await testVaritykitCLI();
}
if (!only || only === 'create-app') {
  results.createApp = await testCreateVarityApp();
}
if (!only || only === 'exports') {
  results.exports = await verifyDocsMatchRealExports(codeBlocks);
}
```

### Step 6: Test and verify (10 min)
```bash
node test-docs.cjs --only packages
node test-docs.cjs --only varitykit
node test-docs.cjs  # Full suite
```

---

**GOAL**: Every code snippet a beta tester copies MUST work.
**STANDARD**: Supabase-level documentation quality.
**POSITIONING**: "Shopify for Business Apps" — targeting consultants/agencies + developers.
