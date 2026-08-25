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
3. `test-positioning-static.cjs`: high-severity public terminology and hosting
   redirect invariants.
4. `astro check`: Astro and content typing.
5. `astro build`: production static-site composition.
6. `test:built-contracts`: verifies Astro copied each public contract artifact
   into `dist/` unchanged.

The checks are repository-local, deterministic, unprivileged, and require no
private checkout or production credential.
