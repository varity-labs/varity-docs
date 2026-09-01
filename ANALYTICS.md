# Docs acquisition and browser-behavior analytics

Status: checked-in implementation contract. Account reports are configuration
recommendations only and are not created by this repository.

## Ownership

Umami owns public acquisition and browser behavior for `docs.varity.so` only.
It does not establish an accepted deployment operation, a healthy public URL, a
paying customer, or a retained deployment. Those facts remain with the
canonical deployment, verification, and billing projections.

The dedicated Docs website is identified by the public tracker ID in
`src/lib/docs-analytics.mjs`. The tracker is fenced to the exact production
hostname. Marketing and Developer Portal website IDs are not accepted by this
module.

## Module and interface

The analytics module has one interface:

- `pageviewPayload` creates one sanitized native Umami pageview.
- `eventPayload` creates a closed custom event.
- `sanitizeOutboundPayload` is the final fail-closed send guard.
- `installDocsAnalytics` connects the interface to the tracker, clicks, and
  Starlight search results.

Its implementation owns exact route/page/category keys, UTM normalization,
event names, event property schemas, Portal handoffs, Do Not Track, and tracker
startup. Callers do not construct analytics payloads.

The deletion test is positive: deleting the module would redistribute hostname
fencing, privacy sanitization, schemas, and route classification across the
Head override, search adapter, and page links. No remote adapter seam is added;
there is one browser implementation and one pure test surface.

## Pageview policy

Automatic pageviews are disabled with `data-auto-pageview="false"`. The module
sends one manual native pageview after the tracker loads on each full document
load. This policy prevents Umami's default URL and referrer fields from leaving
the browser before the sanitizer runs.

The site does not enable Astro view transitions, so each navigation is a full
document load. If client-side navigation is enabled later, that shape change
must add an exactly-once navigation test before capture can continue.

The pageview uses the checked-in page key as its title and
`category:<category-key>` as its tag. Category views are read from the tag
breakdown instead of emitting a second view event. Emitting a custom category
event on every load would make every visit contain at least two events and
would corrupt Umami's bounce definition.

## Privacy and cardinality

Capture occurs only when all of these conditions hold:

- `window.location.hostname` is exactly `docs.varity.so`;
- the pathname is in the checked-in 52-route catalog;
- Do Not Track is not enabled; and
- the outbound payload passes the final closed schema.

The tracker and sanitizer remove the URL hash and referrer. The URL query is
rebuilt from an accepted four-field UTM tuple and cannot contain search text,
code, secrets, tokens, click IDs, or arbitrary query keys. `utm_source`,
`utm_medium`, `utm_campaign`, and `utm_content` must each occur exactly once,
normalize to lowercase, and match one checked-in policy. If any field is
missing, duplicated, or invalid, the whole tuple is discarded. `utm_term` is
always discarded.

The source/medium policies follow the conversion-funnel taxonomy: `blog/content`,
`docs/content`, `x/social`, `x/reply`, `linkedin/social`, `reddit/social`,
`hn/social`, `producthunt/social`, `discord/social`, `github/referral`,
`portal/referral`, `newsletter/email`, and `google/organic`. `templates/seo` is
accepted only as `public-template-gallery` with the bounded generic Docs
placement; arbitrary template slugs do not enter this Docs-owned catalog.

The closed custom events are:

| Event | Properties added by the module | Caller detail |
|---|---|---|
| `docs_search_results_presented` | `page`, `category` | `count_bucket`: `0`, `1`, `2-5`, `6-10`, or `11+` |
| `docs_cta_click` | `page`, `category` | one checked-in CTA key |
| `docs_portal_handoff` | `page`, `category` | `home`, `settings`, or `deploy` |

Search input values are never read. A bounded MutationObserver adapter waits for
Pagefind's loading render and subsequent completed result-list render, then
counts top-level result elements only. A newer input disconnects the prior
observer, a completed render disconnects before emission, and an incomplete
render expires after ten seconds. This rejects stale out-of-order renders and
deduplicates later mutations. An unknown route, send type, event, property,
property value, Portal target, or UTM tuple returns no payload.

## Docs-to-Portal campaign links

Every authored clickable Portal link uses this canonical shape:

```text
https://developer.store.varity.so/<target>?utm_source=docs&utm_medium=content&utm_campaign=docs-to-portal&utm_content=<checked-in-placement-key>
```

The analytics test enumerates every Markdown and HTML Portal hyperlink, proves
its target and four UTM values are canonical for the source page, and fails if
an ungoverned link is added.

## Saved reports for the fenced account writer

These reports answer browser questions only. They are not configured by this
repository:

1. **Docs acquisition (UTM):** hostname `docs.varity.so`; break down the four
   accepted UTM dimensions; label the result attributed browser arrivals.
2. **Docs content:** native pageviews by sanitized path and title key, with the
   `category:*` tag breakdown.
3. **Search usefulness:**
   `docs_search_results_presented -> docs_cta_click | docs_portal_handoff`,
   broken down by `count_bucket`; label counts as browser attempts.
4. **Portal handoff goal:** event `docs_portal_handoff`, broken down by
   `page`, `category`, and `handoff`.
5. **Docs journey:** native pageview -> optional CTA/search event ->
   `docs_portal_handoff`; never extend it to browser `deploy_success` as proof
   of an accepted, healthy, paying, or retained deployment.
6. **Returning-browser retention:** canonical hostname only, with mature cohort
   denominators stated for each interval.

Any saved report must include the exact hostname fence and must preserve the
event/property names above. Recorder, replay, and heatmap remain disabled.

## Verification and deployment gate

`npm run test:analytics` verifies privacy, schemas, route coverage, tracker
configuration, and every Portal-link caller. `npm run check` remains the full
repository gate. Localhost browser verification must prove that no request is
sent from `localhost`, while a production-host browser context sends only the
closed payload shapes.

No account mutation, deployment, publication, or live data reset is performed
by this implementation.
