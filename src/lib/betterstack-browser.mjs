// Better Stack browser error reporting for docs.varity.so.
//
// The application token is public by design and is compiled into every page,
// exactly like the Umami website id in docs-analytics.mjs and the token the
// Developer Portal ships in its own HTML. It identifies the dedicated
// `docs.varity.so` error application; no runtime credential lives here.
export const BETTERSTACK_BROWSER = Object.freeze({
  hostname: 'docs.varity.so',
  applicationToken: 'FLu3pfK3M1Za1khJdRt5cnrM',
});
