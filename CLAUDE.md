# CLAUDE.md - Varity Documentation

This repository publishes the public documentation at `docs.varity.so`. It is
a static Astro/Starlight surface, not a control-plane runtime.

## Read first

Read `ARCHITECTURE.md` here first for content and artifact provenance. When
this repository is checked out through Workspace V2, use these sibling owners
before changing product claims:

- `varity-engineering:CLAUDE.md` for workspace behavior;
- `varity-engineering:CURRENT-STATE.md` for dated shipped-state evidence;
- `varity-engineering:POSITIONING.md` for product language;
- `varity-engineering:PRICING.md` for executable pricing ownership;
- `varity-engineering:ARCHITECTURE.md` for cross-repository change routing.

Authority rules:

- Current runtime code, live evidence, and `varity-engineering:CURRENT-STATE.md`
  own shipped capability and public-interface reality. Documentation projects
  that truth; it does not create it.
- `varity-engineering:POSITIONING.md` and `varity-engineering:PRICING.md` own
  public language and pricing-source routing. Never invent or remember prices.
- The public platform contract originates in
  `varity-platform:services/varity-gateway/src/services/public-api-openapi.ts`.
  The MCP interface originates in `varity-mcp:src/server.ts` and `src/tools/`.
- `src/content/docs/` owns human-facing pages.
- `public/openapi.yaml`, `public/mcp-schema.json`, `public/llms.txt`, and
  `public/llms-full.txt` are checked-in public contract projections. Update and
  verify every affected projection in the same pull request.
- Do not expose providers, credentials, infrastructure mechanics, private
  orchestration logic, or unshipped features in public prose.

## Verification

Run the repository's complete local check before merge:

```bash
npm ci
npm run check
```

For visual or navigation changes, also inspect the local site at
`http://localhost:4321` and verify the affected pages on desktop and mobile.

Every pull request must complete the `Architecture impact` block in the pull
request template. Update `ARCHITECTURE.md` only when ownership, an interface,
artifact provenance, security posture, or publishing topology changes.

## Scope guardrails

- Do not edit backend, portal, CLI, or MCP implementation from this repository.
- Do not copy gate status, live version literals, or temporary release evidence
  into architecture files.
- Do not restore the retired cross-repository PROPAGATION workflow. Repository
  CI is intentionally unprivileged and checks only this checkout.
- Do not treat the legacy live-crawl harness in `tests/test-docs.cjs` as a merge
  gate. It is network-dependent and contains historical checks; the deterministic
  merge gate is `npm run check`.
