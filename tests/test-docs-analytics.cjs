const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const ROOT = path.resolve(__dirname, '..');

function docsSources(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return docsSources(target);
    return /\.mdx?$/.test(entry.name) ? [target] : [];
  });
}

function routeForSource(file) {
  let slug = path.relative(path.join(ROOT, 'src/content/docs'), file).replace(/\\/g, '/').replace(/\.mdx?$/, '');
  if (slug === 'index') slug = '';
  else slug = slug.replace(/\/index$/, '');
  return slug ? `/${slug}/` : '/';
}

(async () => {
  const analytics = await import(pathToFileURL(path.join(ROOT, 'src/lib/docs-analytics.mjs')).href);
  const {
    DOCS_ANALYTICS,
    DOCS_ANALYTICS_PAGE_PATHS,
    DOCS_EVENT_NAMES,
    doNotTrackEnabled,
    eventPayload,
    installDocsAnalytics,
    pageContext,
    pageviewPayload,
    portalHandoff,
    sanitizeOutboundPayload,
    sanitizedUtm,
    searchResultCountBucket,
  } = analytics;

  assert.equal(DOCS_ANALYTICS.hostname, 'docs.varity.so');
  assert.match(DOCS_ANALYTICS.websiteId, /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  assert.deepEqual(DOCS_EVENT_NAMES, [
    'docs_search_results_presented',
    'docs_cta_click',
    'docs_portal_handoff',
  ]);

  const contentFiles = docsSources(path.join(ROOT, 'src/content/docs'));
  const sourceRoutes = contentFiles.map(routeForSource).sort();
  assert.deepEqual([...DOCS_ANALYTICS_PAGE_PATHS].sort(), sourceRoutes, 'every authored route must have one bounded analytics key');
  assert.equal(pageContext('/not-a-doc/'), null);
  assert.deepEqual(pageContext('/deploy/deploy-from-dashboard'), {
    path: '/deploy/deploy-from-dashboard/',
    page: 'deploy-from-dashboard',
    category: 'deploy',
  });

  const location = {
    hostname: 'docs.varity.so',
    pathname: '/deploy/deploy-from-dashboard/',
    search: '?utm_source=X&utm_medium=SOCIAL&utm_campaign=docs-acquisition&utm_content=header&q=private&token=secret&utm_term=code',
    hash: '#private-fragment',
  };
  const pageview = pageviewPayload(location);
  assert.deepEqual(pageview, {
    website: DOCS_ANALYTICS.websiteId,
    hostname: 'docs.varity.so',
    url: '/deploy/deploy-from-dashboard/?utm_source=x&utm_medium=social&utm_campaign=docs-acquisition&utm_content=header',
    title: 'deploy-from-dashboard',
    tag: 'category:deploy',
  });
  assert.equal('referrer' in pageview, false);
  assert.equal(pageview.url.includes('private'), false);
  assert.equal(pageview.url.includes('#'), false);
  assert.equal(pageview.url.includes('utm_term'), false);
  assert.deepEqual(sanitizeOutboundPayload('event', {
    ...pageview,
    screen: '1920x1080',
    language: 'en-US',
    referrer: 'https://search.example/private?q=secret',
  }), pageview, 'known Umami ambient fields must be accepted and stripped by the send hook');
  assert.equal(sanitizeOutboundPayload('identify', pageview), false);
  assert.equal(sanitizeOutboundPayload('unknown', pageview), false);

  const standardPairs = [
    ['blog', 'content'],
    ['discord', 'social'],
    ['docs', 'content'],
    ['github', 'referral'],
    ['google', 'organic'],
    ['hn', 'social'],
    ['linkedin', 'social'],
    ['newsletter', 'email'],
    ['portal', 'referral'],
    ['producthunt', 'social'],
    ['reddit', 'social'],
    ['x', 'reply'],
    ['x', 'social'],
  ];
  for (const [source, medium] of standardPairs) {
    const tuple = `?utm_source=${source}&utm_medium=${medium}&utm_campaign=docs-acquisition&utm_content=header`;
    assert.equal(sanitizedUtm(tuple), tuple, `canonical ${source}/${medium} tuple must be accepted`);
  }
  const templateTuple = '?utm_source=templates&utm_medium=seo&utm_campaign=public-template-gallery&utm_content=docs';
  assert.equal(sanitizedUtm(templateTuple), templateTuple);
  for (const invalidTuple of [
    '?utm_source=docs&utm_medium=content&utm_campaign=docs-acquisition',
    '?utm_source=docs&utm_medium=social&utm_campaign=docs-acquisition&utm_content=header',
    '?utm_source=hn&utm_medium=content&utm_campaign=docs-acquisition&utm_content=header',
    '?utm_source=producthunt&utm_medium=seo&utm_campaign=docs-acquisition&utm_content=header',
    '?utm_source=templates&utm_medium=seo&utm_campaign=docs-acquisition&utm_content=header',
    '?utm_source=templates&utm_medium=content&utm_campaign=public-template-gallery&utm_content=docs',
    '?utm_source=x&utm_source=docs&utm_medium=social&utm_campaign=docs-acquisition&utm_content=header',
    '?utm_source=unreviewed&utm_medium=social&utm_campaign=docs-acquisition&utm_content=header',
  ]) assert.equal(sanitizedUtm(invalidTuple), '', `invalid or partial tuple must be dropped atomically: ${invalidTuple}`);
  assert.equal(pageviewPayload({ ...location, hostname: 'preview.example' }), null);
  assert.equal(pageviewPayload({ ...location, pathname: '/unknown/' }), null);

  const searchEvent = eventPayload('docs_search_results_presented', location, { count_bucket: '2-5' });
  assert.deepEqual(searchEvent.data, {
    page: 'deploy-from-dashboard',
    category: 'deploy',
    count_bucket: '2-5',
  });
  assert.equal(eventPayload('unknown_event', location, {}), null);
  assert.equal(eventPayload('docs_search_results_presented', location, { count_bucket: '2-5', query: 'secret' }), null);
  assert.equal(eventPayload('docs_search_results_presented', location, { count_bucket: '500' }), null);
  assert.equal(sanitizeOutboundPayload('event', { ...pageview, unexpected: true }), false);
  assert.equal(sanitizeOutboundPayload('event', { ...searchEvent, data: { ...searchEvent.data, query: 'secret' } }), false);

  assert.equal(searchResultCountBucket(0), '0');
  assert.equal(searchResultCountBucket(1), '1');
  assert.equal(searchResultCountBucket(5), '2-5');
  assert.equal(searchResultCountBucket(10), '6-10');
  assert.equal(searchResultCountBucket(11), '11+');
  assert.equal(searchResultCountBucket(-1), null);
  assert.equal(doNotTrackEnabled({ doNotTrack: '1' }, {}), true);
  assert.equal(doNotTrackEnabled({ doNotTrack: '0' }, {}), false);

  const listeners = new Map();
  const emitted = [];
  const timers = new Map();
  let nextTimer = 0;
  class FakeMutationObserver {
    static instances = [];
    constructor(callback) {
      this.callback = callback;
      this.disconnected = false;
      FakeMutationObserver.instances.push(this);
    }
    observe(target, options) {
      this.target = target;
      this.options = options;
    }
    disconnect() {
      this.disconnected = true;
    }
  }
  let searchState = 'idle';
  let renderedCount = 0;
  const renderedResults = {
    querySelectorAll: (selector) => {
      assert.equal(selector, ':scope > .pagefind-ui__result');
      return { length: renderedCount };
    },
  };
  const resultsArea = {
    querySelector: (selector) => {
      if (selector === '.pagefind-ui__results') return searchState === 'complete' ? renderedResults : null;
      if (selector === '.pagefind-ui__message') return searchState === 'loading' ? {} : null;
      return null;
    },
  };
  const searchRoot = {
    querySelector: (selector) => selector === '.pagefind-ui__results-area' && searchState !== 'idle' ? resultsArea : null,
  };
  const runtimeLocation = {
    hostname: 'docs.varity.so',
    pathname: '/deploy/deploy-from-dashboard/',
    search: '?utm_source=x&utm_medium=social&utm_campaign=docs-acquisition&utm_content=header&q=private',
    hash: '#private',
  };
  const runtimeWindow = {
    location: runtimeLocation,
    navigator: { doNotTrack: '0' },
    umami: { track: (payload) => emitted.push(payload) },
    MutationObserver: FakeMutationObserver,
    setTimeout: (callback) => {
      const id = ++nextTimer;
      timers.set(id, callback);
      return id;
    },
    clearTimeout: (id) => timers.delete(id),
  };
  const runtimeDocument = {
    addEventListener: (name, handler) => listeners.set(name, handler),
    removeEventListener: (name) => listeners.delete(name),
    getElementById: () => null,
  };
  const installed = installDocsAnalytics(runtimeWindow, runtimeDocument);
  assert.ok(installed);
  assert.deepEqual(emitted.shift(), pageviewPayload(runtimeLocation), 'runtime must emit one sanitized native pageview');

  const portalHref = 'https://developer.store.varity.so/dashboard/deploy?utm_source=docs&utm_medium=content&utm_campaign=docs-to-portal&utm_content=dashboard-deploy';
  listeners.get('click')({
    target: {
      closest: () => ({ href: portalHref, getAttribute: () => null }),
    },
  });
  assert.deepEqual(emitted.map(({ name }) => name), ['docs_cta_click', 'docs_portal_handoff']);
  assert.deepEqual(emitted[1].data, { page: 'deploy-from-dashboard', category: 'deploy', handoff: 'deploy' });
  emitted.length = 0;

  const searchTarget = {
    matches: () => true,
    closest: (selector) => selector === 'site-search' ? searchRoot : null,
    get value() { throw new Error('search input text must never be read'); },
  };
  listeners.get('input')({ target: searchTarget });
  const firstObserver = FakeMutationObserver.instances.at(-1);
  assert.deepEqual(firstObserver.options, { childList: true, subtree: true, characterData: true });

  searchState = 'complete';
  renderedCount = 11;
  firstObserver.callback();
  assert.deepEqual(emitted, [], 'a stale completion before the current loading signal must be ignored');

  searchState = 'loading';
  firstObserver.callback();
  listeners.get('input')({ target: searchTarget });
  const secondObserver = FakeMutationObserver.instances.at(-1);
  assert.equal(firstObserver.disconnected, true, 'a newer input must deterministically replace the prior observer');

  searchState = 'complete';
  renderedCount = 1;
  firstObserver.callback();
  secondObserver.callback();
  assert.deepEqual(emitted, [], 'out-of-order and pre-loading completions must not emit');

  searchState = 'loading';
  secondObserver.callback();
  searchState = 'complete';
  renderedCount = 3;
  secondObserver.callback();
  assert.deepEqual(emitted, [eventPayload('docs_search_results_presented', runtimeLocation, { count_bucket: '2-5' })]);
  secondObserver.callback();
  assert.equal(emitted.length, 1, 'completion mutations must be deduplicated');
  assert.equal(secondObserver.disconnected, true);
  assert.equal(timers.size, 0);

  searchState = 'loading';
  listeners.get('input')({ target: searchTarget });
  const boundedObserver = FakeMutationObserver.instances.at(-1);
  assert.equal(timers.size, 1);
  [...timers.values()][0]();
  assert.equal(boundedObserver.disconnected, true, 'the observer lifetime must be bounded when rendering never completes');
  assert.equal(timers.size, 0);

  listeners.get('input')({ target: searchTarget });
  const disposedObserver = FakeMutationObserver.instances.at(-1);
  installed.dispose();
  assert.equal(listeners.size, 0);
  assert.equal(disposedObserver.disconnected, true);
  assert.equal(timers.size, 0);

  const dntEmitted = [];
  installDocsAnalytics(
    { ...runtimeWindow, __docsAnalyticsInstalled: false, navigator: { doNotTrack: '1' }, umami: { track: (payload) => dntEmitted.push(payload) } },
    runtimeDocument,
  );
  assert.deepEqual(dntEmitted, [], 'Do Not Track must suppress the runtime pageview');

  const portalLinks = [];
  for (const file of contentFiles) {
    const source = fs.readFileSync(file, 'utf8');
    const hrefs = [
      ...source.matchAll(/\]\((https:\/\/developer\.store\.varity\.so[^)]+)\)/g),
      ...source.matchAll(/href=["'](https:\/\/developer\.store\.varity\.so[^"']+)["']/g),
    ].map((match) => match[1]);
    const context = pageContext(routeForSource(file));
    for (const href of hrefs) {
      assert.ok(context, `missing analytics context for ${file}`);
      assert.ok(portalHandoff(href, context.page), `non-canonical Portal handoff in ${path.relative(ROOT, file)}: ${href}`);
      portalLinks.push(href);
    }
  }
  assert.equal(portalLinks.length, 9, 'expected every authored Portal hyperlink to be governed');

  const analyticsSource = fs.readFileSync(path.join(ROOT, 'src/components/DocsAnalytics.astro'), 'utf8');
  for (const attribute of [
    'data-domains={DOCS_ANALYTICS.hostname}',
    'data-auto-pageview="false"',
    'data-exclude-search="true"',
    'data-exclude-hash="true"',
    'data-do-not-track="true"',
    'data-before-send="docsAnalyticsBeforeSend"',
  ]) assert.ok(analyticsSource.includes(attribute), `tracker is missing ${attribute}`);

  if (process.env.VERIFY_DIST === '1') {
    const builtHtml = fs.readFileSync(path.join(ROOT, 'dist/deploy/deploy-from-dashboard/index.html'), 'utf8');
    for (const attribute of [
      'src="https://cloud.umami.is/script.js"',
      `data-website-id="${DOCS_ANALYTICS.websiteId}"`,
      'data-domains="docs.varity.so"',
      'data-auto-pageview="false"',
      'data-exclude-search="true"',
      'data-exclude-hash="true"',
      'data-do-not-track="true"',
      'data-before-send="docsAnalyticsBeforeSend"',
    ]) assert.ok(builtHtml.includes(attribute), `built tracker is missing ${attribute}`);
    assert.equal((builtHtml.match(/id="docs-umami"/g) ?? []).length, 1, 'built page must contain one tracker');

    const bundleMatch = builtHtml.match(/src="(\/_astro\/DocsAnalytics[^"?]+\.js)"/);
    assert.ok(bundleMatch, 'built page must load the analytics runtime bundle');
    const bundle = fs.readFileSync(path.join(ROOT, 'dist', bundleMatch[1]), 'utf8');
    for (const eventName of DOCS_EVENT_NAMES) assert.ok(bundle.includes(eventName), `built runtime is missing ${eventName}`);
  }

  console.log(`PASS docs analytics privacy/schema/callers (${sourceRoutes.length} routes, ${portalLinks.length} Portal links)`);
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
