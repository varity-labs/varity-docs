# Varity Documentation

> **Predictable cloud deployment for supported apps, Docker services, and curated AI agents.**

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Discord](https://img.shields.io/badge/Discord-Join-5865F2?logo=discord&logoColor=white)](https://discord.gg/7vWsdwa2Bg)

This repository is the source for the official Varity documentation at **[docs.varity.so](https://docs.varity.so)**, built with [Astro](https://astro.build) and [Starlight](https://starlight.astro.build).

## What is Varity?

Varity deploys supported Node, Python, Go, and static projects, plus runnable Docker HTTP services and curated AI agent templates. Run one command (or ask your AI editor) and Varity builds your project, provisions detected backend services, and returns a live URL. Pricing is a fixed monthly cost per app based on reserved hardware, so traffic does not change the bill for the same deployment profile.

Varity ships as two packages:

- **`varitykit`** (PyPI) — the deploy CLI
- **`@varity-labs/mcp`** (npm) — the MCP server for AI coding tools (Claude Code, Cursor, Windsurf)

## Quick Start

```bash
# Install the CLI
pipx install varitykit

# Deploy from your project directory
varitykit app deploy
```

Or add the MCP server to your AI editor and deploy with natural language:

```bash
npx -y @varity-labs/mcp
```

## Supported Frameworks

Varity auto-detects and deploys:

| Language | Frameworks |
|----------|-----------|
| Node.js | Next.js, React, Vue, Astro, Qwik, Vite SPA, Express, Fastify, NestJS, Koa, Hono |
| Python | FastAPI, Django, Flask |
| Go | Go modules |
| Static | Plain HTML and static builds |

Auto-wired backend services (provisioned when Varity detects them in your dependencies): **Postgres** (with pgvector), **Redis**, **MongoDB**, **MySQL**, **Ollama**, and **MinIO** (S3-compatible object storage).

**Not supported yet for source builds:** Rust, Ruby / Rails, Elixir / Phoenix, Java / Spring, Deno, PHP / Laravel, .NET. Deploying these from source returns a clear unsupported-language error. You can still deploy them as runnable Docker images. [Request a framework](https://github.com/varity-labs).

## Contributing to the docs

This is an Astro + Starlight site. Run it locally with:

```bash
npm install
npm run dev        # http://localhost:4321
```

Other commands:

```bash
npm run build      # production build to ./dist
npm run preview    # preview the production build
npm run lint       # astro check
```

Documentation content lives in `src/content/docs/`:

```
src/content/docs/
├── getting-started/   # Introduction, installation, quickstart
├── cli/               # CLI command reference
├── deploy/            # Deployment guides and Vercel migration
├── ai-tools/          # MCP server and AI IDE integration
├── guides/            # Framework and workflow guides
├── tutorials/         # End-to-end build tutorials
└── resources/         # FAQ, glossary, pricing, troubleshooting
```

Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a PR. Two rules matter most:

- Every documented command, flag, and code example must be accurate and tested against the current product.
- Document only shipped capabilities. Never describe a feature that is not yet available.

## Community

- **Discord:** [discord.gg/7vWsdwa2Bg](https://discord.gg/7vWsdwa2Bg)
- **X / Twitter:** [@VarityHQ](https://x.com/VarityHQ)
- **Website:** [varity.so](https://www.varity.so)
- **GitHub:** [github.com/varity-labs](https://github.com/varity-labs)

## License

MIT © [Varity Labs](https://www.varity.so). See [LICENSE](LICENSE).
