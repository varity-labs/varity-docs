# CLAUDE.md - Varity Documentation

This repository publishes the public documentation at `docs.varity.so`. It is
a static Astro/Starlight surface, not a control-plane runtime.

## Read first

Start at `/home/macoding/varity-v2/varity-engineering/CLAUDE.md`. Its
`architecture/CHANGE-IMPACT.md` routes product facts to their executable owners;
its `.opencode-plan.md` is the only current workspace finish board. Then read
`ARCHITECTURE.md` here for this repository's stable interfaces and artifact
provenance.

Authority rules:

- Current code, deployed behavior, and live responses own shipped capability.
  Documentation projects that truth; it does not create it.
- Control `POSITIONING.md` owns stable product language. Control `PRICING.md`
  routes mutable values to executable and live owners; unknown values stay
  unknown.
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
- The deterministic merge gate is `npm run check`. Live link and contract
  probes are release evidence, not substitutes for that gate.

## Agent skills

- GitHub Issues and shared operations: [issue tracker](docs/agents/issue-tracker.md).
- Canonical triage roles: [label mapping](docs/agents/triage-labels.md).
- Existing ownership maps, decisions and code: [domain routes](docs/agents/domain.md).
