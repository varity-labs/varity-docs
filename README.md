# Varity Documentation

Official documentation for [Varity](https://varity.so) — the Web3 operating system that lets you deploy real-world apps on decentralized infrastructure in 60 seconds.

**Documentation Site:** [docs.varity.so](https://docs.varity.so)

## Quick Start

```bash
# Install Varity SDK
npm install @varity/sdk @varity/ui-kit

# Deploy your app
npx varietykit deploy
```

## What's in the Docs

### Getting Started
- [Introduction](https://docs.varity.so/getting-started/introduction/) — What is Varity and why use it
- [Installation](https://docs.varity.so/getting-started/installation/) — Set up your environment
- [Quick Start](https://docs.varity.so/getting-started/quickstart/) — Deploy your first app in 5 minutes

### Core Packages
- **[@varity/sdk](https://docs.varity.so/packages/sdk/overview/)** — Core SDK with authentication, storage, and payments
- **[@varity/ui-kit](https://docs.varity.so/packages/ui-kit/overview/)** — React components for login, wallets, and dashboards
- **[@varity/types](https://docs.varity.so/packages/types/overview/)** — TypeScript definitions

### Build Guides
- [Authentication](https://docs.varity.so/build/auth/quickstart/) — Email, social, and wallet login
- [File Storage](https://docs.varity.so/build/storage/quickstart/) — Decentralized file uploads
- [Payments](https://docs.varity.so/build/payments/quickstart/) — Credit card on-ramp and gasless transactions

### CLI Reference
- [VarietyKit CLI](https://docs.varity.so/cli/overview/) — Command-line tool for deploying and managing apps

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

- **Website:** [varity.so](https://varity.so)
- **Documentation:** [docs.varity.so](https://docs.varity.so)
- **GitHub:** [github.com/varity-labs](https://github.com/varity-labs)
- **Discord:** [discord.gg/varity](https://discord.gg/Uhjx6yhJ)
- **Twitter:** [@vaboratory](https://twitter.com/vaboratory)

## License

MIT © [Varity Labs](https://varity.so)

