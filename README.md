# Varity Documentation

> **The easiest way to deploy any app, AI agent, or LLM. 60-80% cheaper than AWS.**

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Discord](https://img.shields.io/discord/7vWsdwa2Bg?label=Discord&logo=discord&logoColor=white)](https://discord.gg/7vWsdwa2Bg)
[![Twitter Follow](https://img.shields.io/twitter/follow/VarityHQ?style=social)](https://x.com/VarityHQ)

**[Documentation](https://docs.varity.so)** | **[Quick Start](https://docs.varity.so/getting-started/quickstart/)** | **[Discord](https://discord.gg/7vWsdwa2Bg)** | **[Twitter/X](https://x.com/VarityHQ)**

---

## What is Varity?

Varity is the easiest way to deploy any app, AI agent, or LLM with your AI coding tool. You describe what you want to build and Varity handles the hosting, database, auth, and payments automatically — 60-80% cheaper than AWS.

No servers to configure. No infrastructure decisions. One command and your app is live.

Varity is an open orchestration protocol. This repository contains the official documentation at [docs.varity.so](https://docs.varity.so).

## Quick Start

```bash
# Install the CLI
pipx install varitykit

# Deploy your app from your AI IDE (Claude Code, Cursor, Windsurf)
# Add the Varity MCP server, then:
varitykit app deploy
```

Or install the MCP server directly:

```bash
npx -y @varity-labs/mcp@beta
```

## Features

- **One-command deploy** — run `varitykit app deploy` from any Next.js, React, Vue, Node, or Python app
- **Auto-configured infrastructure** — database, auth, and storage wired automatically based on your dependencies
- **60-80% cheaper than AWS** — usage-based pricing, pay only for what you use
- **Vercel migration** — `varitykit migrate` converts your Vercel project in seconds
- **AI IDE native** — install the MCP server in Claude Code, Cursor, or Windsurf and deploy with natural language
- **16 MCP tools** — `varity_deploy`, `varity_init`, `varity_migrate`, `varity_cost_calculator`, and more
- **Auto-wired services** — Postgres, Redis, MongoDB, and Ollama detected and configured from `package.json`

## Supported Frameworks

| Framework | Status |
|-----------|--------|
| Next.js | Ready |
| React | Ready |
| Vue | Ready |
| Express / Fastify / Nest / Hono | Ready |
| FastAPI / Django / Flask | Ready |
| Go, Rust, Ruby, Java | Coming soon |

## Documentation Structure

```
src/content/docs/
├── getting-started/     # Introduction, installation, quickstart
├── packages/            # SDK, UI Kit, Types reference
├── build/               # Auth, databases, storage, payments guides
├── cli/                 # CLI commands reference
├── deploy/              # Deployment guides and Vercel migration
├── ai-tools/            # MCP server and AI IDE integration
├── templates/           # App templates and scaffolding
└── resources/           # FAQ, glossary, troubleshooting
```

## Local Development

```bash
git clone https://github.com/varity-labs/varity-docs.git
cd varity-docs
npm install
npm run dev
# Open http://localhost:4321
```

```bash
npm run build    # Production build
npm run preview  # Preview production build
npm test         # Run docs quality checks
```

## Contributing

We welcome contributions! Read [CONTRIBUTING.md](CONTRIBUTING.md) for setup instructions, style guide, and PR requirements.

Key guidelines:
- All code examples must be tested and working before submitting
- Follow the [terminology guide](CONTRIBUTING.md#terminology) — no forbidden vocabulary in prose
- Open an issue before making large changes

## Community

- **Discord:** [discord.gg/7vWsdwa2Bg](https://discord.gg/7vWsdwa2Bg)
- **Twitter/X:** [@VarityHQ](https://x.com/VarityHQ)
- **GitHub Discussions:** [github.com/varity-labs/varity-docs/discussions](https://github.com/varity-labs/varity-docs/discussions)
- **Issues:** [github.com/varity-labs/varity-docs/issues](https://github.com/varity-labs/varity-docs/issues)

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold this standard. Report violations to community@varity.so.

## License

MIT © [Varity Labs](https://www.varity.so) — see [LICENSE](LICENSE) for details.
