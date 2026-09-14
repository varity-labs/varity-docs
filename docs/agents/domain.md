# Domain docs

This repository owns public content and checked-in contract projections. Exact backend source and live responses own shipped behavior.

Use the existing `ARCHITECTURE.md` ownership map and the code routes below.
Cross-repository decisions: `engineering:architecture/DECISIONS.md`; topology: `engineering:architecture/likec4/`. Resolve repository IDs through `engineering:repos.yaml`.

- `astro.config.mjs`: documentation composition and navigation.
- `src/content.config.ts`: content schema and loader.
- `src/content/docs/`: public content.
- `tests/test-contract-artifacts.cjs`: public contract-projection checks.
- `src/lib/docs-analytics.mjs`: browser acquisition capture.

If `CONTEXT.md` or `CONTEXT-MAP.md` exists, read relevant terms and use its vocabulary. Missing glossaries are not defects: continue without scaffolding them. Record only resolved domain terms lazily, keep implementation in code, reuse existing decision locations, and surface conflicts with accepted decisions explicitly.
