export const DOCS_ANALYTICS = Object.freeze({
  hostname: 'docs.varity.so',
  websiteId: 'c55bf3fd-9a22-46b0-8dc9-21c949f068c4',
});

const PAGE_CATALOG = Object.freeze({
  '/': ['home', 'home'],
  '/ai-gateway/': ['ai-gateway', 'ai-gateway'],
  '/ai-gateway/compatibility/': ['ai-gateway-compatibility', 'ai-gateway'],
  '/ai-gateway/models/': ['ai-gateway-models', 'ai-gateway'],
  '/ai-tools/api-reference/': ['ai-tools-api-reference', 'ai-tools'],
  '/ai-tools/mcp-server-spec/': ['ai-tools-mcp-server-spec', 'ai-tools'],
  '/ai-tools/overview/': ['ai-tools-overview', 'ai-tools'],
  '/ai-tools/prompts/': ['ai-tools-prompts', 'ai-tools'],
  '/api/errors/': ['api-errors', 'api'],
  '/api/limits/': ['api-limits', 'api'],
  '/cli/': ['cli', 'cli'],
  '/cli/overview/': ['cli-overview', 'cli'],
  '/cli/commands/auth/': ['cli-auth', 'cli'],
  '/cli/commands/deploy/': ['cli-deploy', 'cli'],
  '/cli/commands/doctor/': ['cli-doctor', 'cli'],
  '/deploy/': ['deploy', 'deploy'],
  '/deploy/auto-wired-services/': ['deploy-auto-wired-services', 'deploy'],
  '/deploy/custom-domains/': ['deploy-custom-domains', 'deploy'],
  '/deploy/databases/': ['deploy-databases', 'deploy'],
  '/deploy/deploy-docker-image/': ['deploy-docker-image', 'deploy'],
  '/deploy/deploy-from-dashboard/': ['deploy-from-dashboard', 'deploy'],
  '/deploy/deploy-your-app/': ['deploy-your-app', 'deploy'],
  '/deploy/deployment-troubleshooting/': ['deploy-troubleshooting', 'deploy'],
  '/deploy/env-variables/': ['deploy-env-variables', 'deploy'],
  '/deploy/intelligent-orchestration/': ['deploy-intelligent-orchestration', 'deploy'],
  '/deploy/managed-credentials/': ['deploy-managed-credentials', 'deploy'],
  '/deploy/rollback/': ['deploy-rollback', 'deploy'],
  '/deploy/supported-frameworks/': ['deploy-supported-frameworks', 'deploy'],
  '/deploy/vercel-migration/': ['deploy-vercel-migration', 'deploy'],
  '/deploy/what-you-can-deploy/': ['deploy-capabilities', 'deploy'],
  '/getting-started/': ['getting-started', 'getting-started'],
  '/getting-started/getting-help/': ['getting-help', 'getting-started'],
  '/getting-started/how-varity-works/': ['how-varity-works', 'getting-started'],
  '/getting-started/installation/': ['installation', 'getting-started'],
  '/getting-started/introduction/': ['introduction', 'getting-started'],
  '/getting-started/quickstart/': ['quickstart', 'getting-started'],
  '/getting-started/quickstart-nextjs/': ['quickstart-nextjs', 'getting-started'],
  '/getting-started/quickstart-python/': ['quickstart-python', 'getting-started'],
  '/getting-started/why-varity/': ['why-varity', 'getting-started'],
  '/guides/deploy-from-ai-ide/': ['guide-ai-ide', 'guides'],
  '/guides/deploy-nextjs/': ['guide-nextjs', 'guides'],
  '/machines/': ['machines', 'machines'],
  '/machines/cpu-vms/': ['machines-cpu-vms', 'machines'],
  '/machines/gpu/': ['machines-gpu', 'machines'],
  '/resources/billing/': ['resources-billing', 'resources'],
  '/resources/faq/': ['resources-faq', 'resources'],
  '/resources/glossary/': ['resources-glossary', 'resources'],
  '/resources/pricing/': ['resources-pricing', 'resources'],
  '/resources/security/': ['resources-security', 'resources'],
  '/resources/troubleshooting/': ['resources-troubleshooting', 'resources'],
  '/tutorials/build-with-ai/': ['tutorial-build-with-ai', 'tutorials'],
  '/tutorials/deploy-ai-agent/': ['tutorial-deploy-ai-agent', 'tutorials'],
});

export const DOCS_EVENT_NAMES = Object.freeze([
  'docs_search_results_presented',
  'docs_cta_click',
  'docs_portal_handoff',
]);

const EVENT_DETAILS = Object.freeze({
  docs_search_results_presented: Object.freeze({
    count_bucket: new Set(['0', '1', '2-5', '6-10', '11+']),
  }),
  docs_cta_click: Object.freeze({
    cta: new Set(['start-deploying', 'setup-mcp', 'portal-home', 'portal-settings', 'portal-deploy']),
  }),
  docs_portal_handoff: Object.freeze({
    handoff: new Set(['home', 'settings', 'deploy']),
  }),
});

const STANDARD_UTM_CAMPAIGNS = new Set(['docs', 'docs-acquisition', 'docs-navigation', 'product-docs']);
const STANDARD_UTM_CONTENT = new Set(['docs', 'footer', 'header', 'homepage', 'readme', 'release-notes']);
const INBOUND_UTM_POLICIES = Object.freeze([
  ['blog', 'content', STANDARD_UTM_CAMPAIGNS, STANDARD_UTM_CONTENT],
  ['discord', 'social', STANDARD_UTM_CAMPAIGNS, STANDARD_UTM_CONTENT],
  ['docs', 'content', STANDARD_UTM_CAMPAIGNS, STANDARD_UTM_CONTENT],
  ['github', 'referral', STANDARD_UTM_CAMPAIGNS, STANDARD_UTM_CONTENT],
  ['google', 'organic', STANDARD_UTM_CAMPAIGNS, STANDARD_UTM_CONTENT],
  ['hn', 'social', STANDARD_UTM_CAMPAIGNS, STANDARD_UTM_CONTENT],
  ['linkedin', 'social', STANDARD_UTM_CAMPAIGNS, STANDARD_UTM_CONTENT],
  ['newsletter', 'email', STANDARD_UTM_CAMPAIGNS, STANDARD_UTM_CONTENT],
  ['portal', 'referral', STANDARD_UTM_CAMPAIGNS, STANDARD_UTM_CONTENT],
  ['producthunt', 'social', STANDARD_UTM_CAMPAIGNS, STANDARD_UTM_CONTENT],
  ['reddit', 'social', STANDARD_UTM_CAMPAIGNS, STANDARD_UTM_CONTENT],
  ['templates', 'seo', new Set(['public-template-gallery']), new Set(['docs'])],
  ['x', 'reply', STANDARD_UTM_CAMPAIGNS, STANDARD_UTM_CONTENT],
  ['x', 'social', STANDARD_UTM_CAMPAIGNS, STANDARD_UTM_CONTENT],
]);
const UTM_KEYS = Object.freeze(['utm_source', 'utm_medium', 'utm_campaign', 'utm_content']);
const SEARCH_OBSERVER_LIFETIME_MS = 10_000;

const PORTAL_CONTENT_BY_PAGE = Object.freeze({
  'ai-gateway': new Set(['ai-gateway-api-keys']),
  'ai-tools-api-reference': new Set(['api-reference-api-keys']),
  'cli-auth': new Set(['cli-auth-api-keys']),
  'deploy-docker-image': new Set(['docker-image-dashboard']),
  'deploy-from-dashboard': new Set(['dashboard-account', 'dashboard-deploy']),
  'resources-glossary': new Set(['glossary-api-keys']),
  'resources-pricing': new Set(['pricing-portal']),
  'tutorial-deploy-ai-agent': new Set(['ai-agent-templates']),
});

const PORTAL_PATHS = Object.freeze({
  '/': Object.freeze({ handoff: 'home', cta: 'portal-home' }),
  '/dashboard/settings': Object.freeze({ handoff: 'settings', cta: 'portal-settings' }),
  '/dashboard/deploy': Object.freeze({ handoff: 'deploy', cta: 'portal-deploy' }),
});

function plainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function exactKeys(value, keys) {
  return plainObject(value) && Object.keys(value).length === keys.length && keys.every((key) => Object.hasOwn(value, key));
}

function allowedKeys(value, required, optional = []) {
  if (!plainObject(value) || !required.every((key) => Object.hasOwn(value, key))) return false;
  const allowed = new Set([...required, ...optional]);
  return Object.keys(value).every((key) => allowed.has(key));
}

function normalizedPath(pathname) {
  if (typeof pathname !== 'string' || !pathname.startsWith('/')) return null;
  return pathname === '/' || pathname.endsWith('/') ? pathname : `${pathname}/`;
}

export function pageContext(pathname) {
  const path = normalizedPath(pathname);
  const entry = path ? PAGE_CATALOG[path] : undefined;
  return entry ? Object.freeze({ path, page: entry[0], category: entry[1] }) : null;
}

function normalizedAllowedValue(value, allowed) {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toLowerCase();
  return allowed.has(normalized) ? normalized : null;
}

export function sanitizedUtm(search) {
  const input = new URLSearchParams(typeof search === 'string' ? search : '');
  if (!UTM_KEYS.every((key) => input.getAll(key).length === 1)) return '';
  const values = Object.fromEntries(UTM_KEYS.map((key) => [key, input.get(key)?.trim().toLowerCase()]));
  const policy = INBOUND_UTM_POLICIES.find(([source, medium]) => values.utm_source === source && values.utm_medium === medium);
  if (!policy || !policy[2].has(values.utm_campaign) || !policy[3].has(values.utm_content)) return '';
  return `?${new URLSearchParams(values).toString()}`;
}

function safeLocationUrl(value) {
  if (typeof value !== 'string') return null;
  try {
    const url = new URL(value, `https://${DOCS_ANALYTICS.hostname}`);
    return url.hostname === DOCS_ANALYTICS.hostname ? url : null;
  } catch {
    return null;
  }
}

function sanitizedBase(payload) {
  if (!plainObject(payload)) return null;
  if (payload.website !== DOCS_ANALYTICS.websiteId || payload.hostname !== DOCS_ANALYTICS.hostname) return null;
  const url = safeLocationUrl(payload.url);
  const context = url ? pageContext(url.pathname) : null;
  if (!url || !context) return null;
  return {
    context,
    payload: {
      website: DOCS_ANALYTICS.websiteId,
      hostname: DOCS_ANALYTICS.hostname,
      url: `${context.path}${sanitizedUtm(url.search)}`,
      title: context.page,
      tag: `category:${context.category}`,
    },
  };
}

function sanitizedEventData(name, data, context) {
  const definition = EVENT_DETAILS[name];
  if (!definition || !plainObject(data)) return null;
  const keys = Object.keys(definition);
  const isCallerShape = exactKeys(data, keys);
  const isSanitizedShape = exactKeys(data, ['page', 'category', ...keys]) && data.page === context.page && data.category === context.category;
  if (!isCallerShape && !isSanitizedShape) return null;
  const detail = {};
  for (const key of keys) {
    const value = normalizedAllowedValue(data[key], definition[key]);
    if (!value) return null;
    detail[key] = value;
  }
  return { page: context.page, category: context.category, ...detail };
}

export function sanitizeOutboundPayload(type, payload) {
  if (type !== 'event') return false;
  if (!plainObject(payload)) return false;
  const pageviewKeys = Object.hasOwn(payload, 'title') || Object.hasOwn(payload, 'tag')
    ? ['website', 'hostname', 'url', 'title', 'tag']
    : ['website', 'hostname', 'url'];
  const requiredKeys = payload.name === undefined ? pageviewKeys : [...pageviewKeys, 'name', 'data'];
  if (!allowedKeys(payload, requiredKeys, ['screen', 'language', 'referrer'])) return false;
  const base = sanitizedBase(payload);
  if (!base) return false;
  if (payload.name === undefined) return base.payload;
  if (typeof payload.name !== 'string' || !DOCS_EVENT_NAMES.includes(payload.name)) return false;
  const data = sanitizedEventData(payload.name, payload.data, base.context);
  return data ? { ...base.payload, name: payload.name, data } : false;
}

export function pageviewPayload(location) {
  if (!location || location.hostname !== DOCS_ANALYTICS.hostname) return null;
  return sanitizeOutboundPayload('event', {
    website: DOCS_ANALYTICS.websiteId,
    hostname: DOCS_ANALYTICS.hostname,
    url: `${location.pathname ?? ''}${location.search ?? ''}${location.hash ?? ''}`,
  }) || null;
}

export function eventPayload(name, location, detail) {
  const pageview = pageviewPayload(location);
  if (!pageview) return null;
  return sanitizeOutboundPayload('event', { ...pageview, name, data: detail }) || null;
}

export function searchResultCountBucket(count) {
  if (!Number.isSafeInteger(count) || count < 0) return null;
  if (count === 0) return '0';
  if (count === 1) return '1';
  if (count <= 5) return '2-5';
  if (count <= 10) return '6-10';
  return '11+';
}

export function portalHandoff(href, page) {
  if (typeof href !== 'string' || typeof page !== 'string') return null;
  let url;
  try {
    url = new URL(href);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' || url.hostname !== 'developer.store.varity.so' || url.hash) return null;
  const target = PORTAL_PATHS[url.pathname];
  const allowedContent = PORTAL_CONTENT_BY_PAGE[page];
  const content = url.searchParams.get('utm_content');
  if (!target || !allowedContent || !content || !allowedContent.has(content)) return null;
  const expected = new URLSearchParams({
    utm_source: 'docs',
    utm_medium: 'content',
    utm_campaign: 'docs-to-portal',
    utm_content: content,
  });
  return url.searchParams.toString() === expected.toString() ? target : null;
}

export function doNotTrackEnabled(navigatorLike, windowLike) {
  return navigatorLike?.doNotTrack === '1' || navigatorLike?.msDoNotTrack === '1' || windowLike?.doNotTrack === '1';
}

export function installDocsAnalytics(windowLike, documentLike) {
  if (!windowLike || !documentLike || windowLike.__docsAnalyticsInstalled) return null;
  windowLike.__docsAnalyticsInstalled = true;
  windowLike.docsAnalyticsBeforeSend = sanitizeOutboundPayload;

  const allowed = () => !doNotTrackEnabled(windowLike.navigator, windowLike) && pageContext(windowLike.location?.pathname) !== null && windowLike.location?.hostname === DOCS_ANALYTICS.hostname;
  const emit = (payload) => {
    if (!payload || !allowed() || typeof windowLike.umami?.track !== 'function') return false;
    windowLike.umami.track(payload);
    return true;
  };
  const emitPageview = () => emit(pageviewPayload(windowLike.location));

  const tracker = documentLike.getElementById?.('docs-umami');
  if (typeof windowLike.umami?.track === 'function') emitPageview();
  else tracker?.addEventListener?.('load', emitPageview, { once: true });

  const onClick = (event) => {
    const anchor = event.target?.closest?.('a[href]');
    if (!anchor) return;
    const context = pageContext(windowLike.location?.pathname);
    if (!context) return;
    const declaredCta = anchor.getAttribute?.('data-docs-cta');
    if (declaredCta) emit(eventPayload('docs_cta_click', windowLike.location, { cta: declaredCta }));
    const handoff = portalHandoff(anchor.href, context.page);
    if (handoff) {
      emit(eventPayload('docs_cta_click', windowLike.location, { cta: handoff.cta }));
      emit(eventPayload('docs_portal_handoff', windowLike.location, { handoff: handoff.handoff }));
    }
  };

  let searchObservation;
  const stopSearchObservation = () => {
    if (!searchObservation) return;
    searchObservation.observer.disconnect();
    windowLike.clearTimeout?.(searchObservation.deadline);
    searchObservation = undefined;
  };
  const onInput = (event) => {
    if (!event.target?.matches?.('site-search input[type="search"], .pagefind-ui__search-input')) return;
    stopSearchObservation();
    const searchRoot = event.target.closest?.('site-search');
    if (!searchRoot || typeof windowLike.MutationObserver !== 'function' || typeof windowLike.setTimeout !== 'function') return;

    let sawCurrentLoading = false;
    const observer = new windowLike.MutationObserver(() => {
      if (searchObservation?.observer !== observer) return;
      const resultsArea = searchRoot.querySelector?.('.pagefind-ui__results-area');
      if (!resultsArea) return;
      const renderedResults = resultsArea.querySelector?.('.pagefind-ui__results');
      if (!renderedResults) {
        if (resultsArea.querySelector?.('.pagefind-ui__message')) sawCurrentLoading = true;
        return;
      }
      if (!sawCurrentLoading) return;
      const count = renderedResults.querySelectorAll?.(':scope > .pagefind-ui__result').length ?? 0;
      const countBucket = searchResultCountBucket(count);
      stopSearchObservation();
      if (countBucket) emit(eventPayload('docs_search_results_presented', windowLike.location, { count_bucket: countBucket }));
    });
    observer.observe(searchRoot, { childList: true, subtree: true, characterData: true });
    const deadline = windowLike.setTimeout(() => {
      if (searchObservation?.observer === observer) stopSearchObservation();
    }, SEARCH_OBSERVER_LIFETIME_MS);
    searchObservation = { observer, deadline };
  };

  documentLike.addEventListener?.('click', onClick);
  documentLike.addEventListener?.('input', onInput);
  return {
    dispose() {
      documentLike.removeEventListener?.('click', onClick);
      documentLike.removeEventListener?.('input', onInput);
      stopSearchObservation();
      windowLike.__docsAnalyticsInstalled = false;
    },
  };
}

export const DOCS_ANALYTICS_PAGE_PATHS = Object.freeze(Object.keys(PAGE_CATALOG));
