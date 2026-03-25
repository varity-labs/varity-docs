# Varity Documentation

Official documentation for [Varity](https://www.varity.so) — build, deploy, and sell business apps in 60 seconds. Auth, database, hosting, and payments included.

**Live Site:** [docs.varity.so](https://docs.varity.so)

## Quick Start

```bash
# Install Varity SDK
npm install @varity-labs/sdk @varity-labs/ui-kit

# Install CLI and deploy
pip install varitykit
varitykit app deploy
```

## What's in the Docs

### Getting Started
- [Introduction](https://docs.varity.so/getting-started/introduction/) — What is Varity and why use it
- [Installation](https://docs.varity.so/getting-started/installation/) — Set up your environment
- [Quick Start](https://docs.varity.so/getting-started/quickstart/) — Deploy your first app in 5 minutes

### Core Packages
- **[@varity-labs/sdk](https://docs.varity.so/packages/sdk/overview/)** — Core SDK with authentication, storage, and payments
- **[@varity-labs/ui-kit](https://docs.varity.so/packages/ui-kit/overview/)** — React components for login and dashboards
- **[@varity-labs/types](https://docs.varity.so/packages/types/overview/)** — TypeScript definitions

### Build Guides
- [Authentication](https://docs.varity.so/build/auth/quickstart/) — Email, social, and wallet login
- [File Storage](https://docs.varity.so/build/storage/quickstart/) — Decentralized file uploads
- [Payments](https://docs.varity.so/build/payments/quickstart/) — Credit card payments and free operations

### CLI Reference
- [VarityKit CLI](https://docs.varity.so/cli/overview/) — Command-line tool for deploying and managing apps

## Local Development

```bash
# Clone the repository
git clone https://github.com/varity-labs/varity-docs.git
cd varity-docs

# Install dependencies
npm install

# Start development server
npm run dev
# → http://localhost:4321

# Build for production
npm run build

# Preview production build
npm run preview
```

## Tech Stack

- [Astro](https://astro.build) — Static site generator
- [Starlight](https://starlight.astro.build) — Documentation framework
- [TypeScript](https://www.typescriptlang.org/) — Type safety

## Contributing

We welcome contributions! Please see our [contributing guidelines](CONTRIBUTING.md) for details.

### Documentation Structure

```
src/content/docs/
├── getting-started/     # Intro, installation, quickstart
├── packages/            # SDK, UI Kit, Types documentation
├── build/               # Auth, Storage, Payments guides
├── cli/                 # CLI commands reference
├── deploy/              # Deployment guides
└── resources/           # FAQ, glossary, troubleshooting
```

## Links

- **Website:** [varity.so](https://www.varity.so)
- **Documentation:** [docs.varity.so](https://docs.varity.so)
- **GitHub:** [github.com/varity-labs](https://github.com/varity-labs)
- **Discord:** [discord.gg/7vWsdwa2Bg](https://discord.gg/7vWsdwa2Bg)
- **Twitter:** [@VarityHQ](https://x.com/VarityHQ)

## License

MIT © [Varity Labs](https://www.varity.so)

