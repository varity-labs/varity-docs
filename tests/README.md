# Documentation verification

The deterministic merge gate is:

```bash
npm run check
```

It runs:

1. `test-architecture-governance.cjs`: required architecture entrypoints and
   pull-request impact declaration.
2. `test-contract-artifacts.cjs`: checked-in OpenAPI, MCP, and LLM publication
   artifacts.
3. `test-generated-artifacts.mjs`: generated-artifact drift check. Regenerates
   `public/llms.txt`, `public/llms-full.txt`, and `public/openapi.yaml` from
   their checked-in sources and fails on any difference. Regenerate with
   `node tools/generate-ai-gateway-artifacts.mjs --update`.
4. `test-positioning-static.cjs`: high-severity public terminology and hosting
   redirect invariants.
5. `astro check`: Astro and content typing.
6. `astro build`: production static-site composition.
7. `test:built-contracts`: verifies Astro copied each public contract artifact
   into `dist/` unchanged.

The checks are repository-local, deterministic, unprivileged, and require no
private checkout or production credential. Live link and upstream-contract
probes are separate release evidence; they must derive their route and claim
inputs from current owners rather than a hand-maintained page or price list.
