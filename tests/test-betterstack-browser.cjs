const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const ROOT = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(ROOT, file), 'utf8');
const count = (source, needle) => source.split(needle).length - 1;

(async () => {
  const { BETTERSTACK_BROWSER } = await import(pathToFileURL(path.join(ROOT, 'src/lib/betterstack-browser.mjs')).href);
  assert.equal(BETTERSTACK_BROWSER.hostname, 'docs.varity.so');
  assert.match(BETTERSTACK_BROWSER.jsTagToken, /^[A-Za-z0-9]{20,}$/, 'js tag token must be the public browser token');

  const head = read('src/components/overrides/Head.astro');
  assert.equal(count(head, '<BetterStackBrowser />'), 1, 'exactly one browser error tag must be mounted');
  assert.ok(head.indexOf('<BetterStackBrowser />') > head.indexOf('<Default />'), 'the tag must follow the default head');

  const integration = read('src/components/BetterStackBrowser.astro');
  for (const marker of [
    "import { BETTERSTACK_BROWSER } from '../lib/betterstack-browser.mjs'",
    'window.location.hostname === hostname',
    "'https://betterstack.net/b.js?t='",
    "betterstack('config'",
    "betterstack('init')",
    'chrome-extension://',
    'moz-extension://',
  ]) assert.ok(integration.includes(marker), `browser error tag is missing ${marker}`);
  assert.equal(integration.includes("betterstack('user'"), false, 'the docs tag must not identify users');

  const packageJson = read('package.json');
  assert.equal(packageJson.includes('@sentry/'), false, 'no standalone Sentry SDK may compete with the tag');

  if (process.env.VERIFY_DIST === '1') {
    const builtHtml = read('dist/deploy/deploy-from-dashboard/index.html');
    assert.equal(count(builtHtml, 'id="docs-betterstack"'), 1, 'built page must contain one browser error tag');
    assert.equal(count(builtHtml, 'https://betterstack.net/b.js?t='), 1, 'built page must load the tag once');
    assert.ok(builtHtml.includes(`"${BETTERSTACK_BROWSER.jsTagToken}"`), 'built page must carry the public js tag token');
    assert.ok(builtHtml.includes(`"${BETTERSTACK_BROWSER.hostname}"`), 'built page must carry the exact-host fence');
  }

  if (process.env.VERIFY_LIVE === '1') {
    // Network check, deliberately outside `npm test`/CI: the only way to tell the
    // js tag token from the same application's ingest token is to ask b.js.
    const response = await fetch(`https://betterstack.net/b.js?t=${BETTERSTACK_BROWSER.jsTagToken}`);
    const body = await response.text();
    assert.equal(response.status, 200, 'b.js must answer 200 for the js tag token');
    assert.equal(body.includes('Invalid token'), false, 'b.js rejected the token: this is the ingest token, not js_tag_token');
    assert.ok(body.length > 100000, `b.js must serve the SDK, got ${body.length} bytes`);
  }

  console.log('PASS Better Stack browser error tag (single mount, exact-host fence, public js tag token)');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
