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
  assert.match(BETTERSTACK_BROWSER.applicationToken, /^[A-Za-z0-9]{20,}$/, 'application token must be the public browser token');

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
    assert.ok(builtHtml.includes(`"${BETTERSTACK_BROWSER.applicationToken}"`), 'built page must carry the public application token');
    assert.ok(builtHtml.includes(`"${BETTERSTACK_BROWSER.hostname}"`), 'built page must carry the exact-host fence');
  }

  console.log('PASS Better Stack browser error tag (single mount, exact-host fence, public token)');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
