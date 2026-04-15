# Varity Docs Automated Tester v4.0 (World-Class Edition)

Enterprise-grade documentation testing for [docs.varity.so](https://docs.varity.so). **Auto-discovers** all pages by crawling, extracts every code snippet, and runs **nine test suites** to catch issues before your users do — just like Vercel and Supabase test their docs.

## What it tests

| Suite | What it checks | Why it matters |
|-------|---------------|----------------|
| **1. Page Discovery** | Auto-crawls to find ALL pages | No manual list maintenance |
| **2. Link Checker** | Every internal and external link | Broken links = broken trust |
| **3. Anchor Validator** | Every `#section` link | Catches broken heading links |
| **4. Code Extractor** | Extracts and categorizes every code block | Baseline for all code tests |
| **5. Import Validator** | Every import/require against real npm packages | Wrong package names = instant developer churn |
| **6. SDK Version Check** | Verifies packages exist on npm | Catches references to unpublished packages |
| **7. Positioning Compliance** | Scans for forbidden words (blockchain, wallet, Web3, etc.) | Maintains the "invisible infrastructure" positioning |
| **8. Consistency Check** | Package names, CLI commands, revenue %, pricing across all pages | Contradictions destroy credibility |
| **9. TypeScript Compiler** | Compiles TS/TSX against REAL @varity-labs/sdk types | Catches type errors before users copy-paste |

## Quick start

```bash
git clone <this-repo>
cd varity-docs-tester
npm install
npm test
```

## Run specific suites

```bash
# Run all tests (with auto-discovery)
npm test

# Run individual suites
npm run test:links        # Check all links
npm run test:anchors      # Check #section links
npm run test:imports      # Validate import statements
npm run test:versions     # Check SDK versions on npm
npm run test:positioning  # Check for forbidden words
npm run test:consistency  # Check for contradictions
npm run test:typescript   # TypeScript compilation

# Skip auto-discovery (use hardcoded page list - faster)
npm run test:fast

# Or with node directly
node test-docs.js --only links
node test-docs.js --only anchors
node test-docs.js --only versions
node test-docs.js --no-discover    # Skip auto-discovery
```

## Enterprise Mode (Real SDK Type Checking)

For full type checking against the actual `@varity-labs/sdk` package:

```bash
# One-time setup: installs SDK packages locally
npm run setup

# Now run tests with real SDK types
npm test
```

This installs the SDK in an isolated `.sdk-test-env/` directory and validates:
- All imports resolve to real exports
- TypeScript types match the SDK's actual types
- No "Property does not exist" or "has no exported member" errors

## Output

The tester generates two reports:

1. **`reports/docs-test-YYYY-MM-DD.json`** — Full machine-readable report
2. **`reports/CLAUDE-CODE-FIX-LIST.md`** — Paste into Claude Code to auto-fix all issues

### Example output

```
╔══════════════════════════════════════════════════════════╗
║     VARITY DOCS AUTOMATED TESTER v4.0 (World-Class)      ║
║   Auto-Discovery • SDK Validation • Anchor Checking      ║
╚══════════════════════════════════════════════════════════╝

🔍 AUTO-DISCOVERING all documentation pages...

  ✓ Found: /
  ✓ Found: /getting-started/introduction/
  ✓ Found: /getting-started/quickstart/
  ...

  📄 Discovered 24 documentation pages

━━━ SDK VERSION CHECK ━━━
  ✓ @varity-labs/sdk@1.2.3 (published on npm)
  ✓ @varity-labs/ui-kit@0.9.0 (published on npm)

━━━ ANCHOR LINK VALIDATOR ━━━
  ✓ 156 anchor links OK
  ✗ 3 broken anchor links

━━━ IMPORT VALIDATOR ━━━
  ✓ 89 imports/installs OK
  ✗ 1 wrong package name
    → CRITICAL: "@varity/sdk" should be "@varity-labs/sdk"

═══════════════════════════════════════════════════════════
  VARITY DOCS TEST REPORT
═══════════════════════════════════════════════════════════
  Pages crawled:    24/24
  Tests passed:     1,247
  Tests failed:     4
  CRITICAL issues:  1
  HIGH issues:      2
  MEDIUM issues:    1
═══════════════════════════════════════════════════════════
```

## CI/CD Integration

Copy `.github/workflows/test-docs.yml` into your docs repo:

- Runs on every push to `main`
- Runs on every PR
- Runs daily at 8am UTC (catches external link rot)
- Posts results as PR comments
- Fails the build on critical issues
- Uploads full test report as artifact

## Configuration

Edit `test-docs.js` to customize:

### Fallback docs pages (line ~72)
Used when auto-discovery is disabled or fails:
```javascript
const DOCS_PAGES = [
  '/',
  '/getting-started/introduction/',
  '/getting-started/installation/',
  // ... add your pages
];
```

### Valid npm packages (line ~125)
```javascript
const VALID_NPM_PACKAGES = {
  '@varity-labs/sdk': true,
  '@varity-labs/ui-kit': true,
  '@varity-labs/types': true,
  // ... add your packages
};
```

### Forbidden words for positioning (line ~143)
```javascript
const FORBIDDEN_WORDS = [
  { word: 'blockchain', severity: 'HIGH', context: 'Use "distributed infrastructure" instead' },
  { word: 'web3', severity: 'HIGH', context: 'Use "next-generation infrastructure" instead' },
  // ... customize for your brand
];
```

### Links to ignore (line ~62)
```javascript
const IGNORED_LINK_PATTERNS = [
  /^https:\/\/chat\.openai\.com/,  // Known to block bots
  /^http:\/\/localhost/,            // Expected in docs
  // ... add false positives
];
```

## Exit codes

| Code | Meaning |
|------|---------|
| `0` | No critical issues |
| `1` | Critical issues found |
| `2` | Fatal error |

## Requirements

- Node.js >= 18.0.0
- npm (for installing dependencies)
- Network access to docs.varity.so

## What makes this "world-class"?

This tester implements the same patterns used by top developer documentation sites:

| Feature | Vercel | Supabase | Varity Tester |
|---------|--------|----------|---------------|
| Auto page discovery | ✓ | ✓ | ✓ |
| Link validation | ✓ | ✓ | ✓ |
| Anchor link checking | ✓ | ✓ | ✓ |
| Code syntax validation | ✓ | ✓ | ✓ |
| Import verification | ✓ | ✓ | ✓ |
| SDK type checking | ✓ | ✓ | ✓ |
| CI/CD integration | ✓ | ✓ | ✓ |
| Auto-fix report | - | - | ✓ (Claude Code) |

## License

MIT
