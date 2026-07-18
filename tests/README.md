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

`test-docs.cjs` is a retained historical live-crawl harness. It depends on the
network and contains checks for retired product surfaces, so it is not part of
`npm test` or CI. Do not cite it as proof that the current docs are correct. A
separate cleanup change may port still-useful checks into deterministic tests
before deleting it.
