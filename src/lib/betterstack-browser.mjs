// Better Stack browser error reporting for docs.varity.so.
//
// `jsTagToken` is the application's `js_tag_token` (Better Stack Errors API,
// `GET https://errors.betterstack.com/api/v1/applications`), the value the
// Frontend tab prints into the `<script>` snippet. It is NOT the ingest
// `token`/DSN of the same application: `betterstack.net/b.js?t=` answers that
// one with `console.error('[betterstack.js]: Invalid token...')` and reports
// nothing, which is exactly what shipped in #119. The js tag token is public
// by design and is compiled into every page, exactly like the Umami website
// id in docs-analytics.mjs; no runtime credential lives here.
export const BETTERSTACK_BROWSER = Object.freeze({
  hostname: 'docs.varity.so',
  jsTagToken: 'pvHyZ213jyJBGJbKBNH4uCMq',
});
