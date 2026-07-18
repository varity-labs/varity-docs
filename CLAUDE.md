# CLAUDE.md - Varity Documentation

Status: repository entrypoint
Last updated: 2026-07-18

This repository publishes the public documentation at `docs.varity.so`. It is
a static Astro/Starlight surface, not a control-plane runtime.

## Read first

When this checkout is inside the Varity workspace, read the workspace root
`CLAUDE.md`, `varity.manifest.yaml`, `POSITIONING.md`, and
`PRICING-MODEL-CANONICAL.md` before changing product claims. Then read
`ARCHITECTURE.md` here for content and artifact provenance.

Authority rules:

- The workspace manifest and live code own shipped capability and public
  interface reality. Documentation projects that truth; it does not create it.
- The root positioning and pricing authorities own public language and claim
  structure. Never hardcode live pricing numbers.
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
