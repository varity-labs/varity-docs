# CLAUDE.md - Varity Documentation

Status: repository entrypoint
Last updated: 2026-08-19

This repository publishes the public documentation at `docs.varity.so`. It is
a static Astro/Starlight surface, not a control-plane runtime.

## Read first

Cross-repository authority lives in the `varity-engineering` control
repository, checked out at `/workspaces/varity-engineering/`. Read these before
changing product claims:

- `CURRENT-STATE.md` — dated shipped, unfinished, and blocker status.
- `repos.yaml` — repository topology and remotes.
- `POSITIONING.md` — stable product definition and public language.
- `PRICING.md` — pricing-source routing; `PRICING-AND-BILLING.md` — the
  consolidated pricing and billing model.

Then read `ARCHITECTURE.md` here for content and artifact provenance.

Authority rules:

- Live code and live gateway responses own shipped capability and public
  interface reality. Documentation projects that truth; it does not create it.
  `CURRENT-STATE.md` records what has been verified shipped.
- The control repository's positioning authority owns public language and claim
  structure.
- Pricing numbers are owned by the gateway, not by any document. Take them from
  the live `GET /api/pricing` response, or from the executable owners that
  `PRICING.md` routes to; never invent, remember, or derive a price from any
  other source.
- `src/content/docs/` owns human-facing pages.
- `public/openapi.yaml`, `public/mcp-schema.json`, `public/llms.txt`, and
  `public/llms-full.txt` are checked-in public contract projections. Update and
  verify every affected projection in the same pull request.
- Do not expose providers, credentials, infrastructure mechanics, private
  orchestration logic, or unshipped features in public prose.

## Verification

Install dependencies with `npm install` when needed, then run the repository's
complete local check before merge:

```bash
npm run check
```

For visual or navigation changes, also inspect the local site at
`http://localhost:4321` at 1440x900, 768x900, and 390x844.

Every pull request must complete the `Architecture impact` block in the pull
request template. Update `ARCHITECTURE.md` only when ownership, an interface,
artifact provenance, security posture, or publishing topology changes.

## Scope guardrails

- Do not edit backend, portal, CLI, or MCP implementation from this repository.
- Do not copy gate status, live version literals, or temporary release evidence
  into architecture files.
- Do not restore the retired cross-repository PROPAGATION workflow. Repository
  CI is intentionally unprivileged and checks only this checkout.
