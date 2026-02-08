# Varity Cursor Rules

AI-powered development assistance for Varity applications.

## Quick Install

```bash
curl -fsSL https://docs.varity.so/cursor-rules/install-varity-rules.sh | bash
```

## Manual Install

Download individual rules:

```bash
# Create directory
mkdir -p .cursor/rules

# Download rules
curl -o .cursor/rules/varity-deploy.mdc https://docs.varity.so/cursor-rules/varity-deploy.mdc
curl -o .cursor/rules/varity-auth.mdc https://docs.varity.so/cursor-rules/varity-auth.mdc
curl -o .cursor/rules/varity-storage.mdc https://docs.varity.so/cursor-rules/varity-storage.mdc
curl -o .cursor/rules/varity-errors.mdc https://docs.varity.so/cursor-rules/varity-errors.mdc
curl -o .cursor/rules/varity-testing.mdc https://docs.varity.so/cursor-rules/varity-testing.mdc
curl -o .cursor/rules/varity-typescript.mdc https://docs.varity.so/cursor-rules/varity-typescript.mdc
curl -o .cursor/rules/varity-performance.mdc https://docs.varity.so/cursor-rules/varity-performance.mdc
curl -o .cursor/rules/varity-contracts.mdc https://docs.varity.so/cursor-rules/varity-contracts.mdc
```

## Available Rules

| Rule | Description | Focus |
|------|-------------|-------|
| `varity-deploy.mdc` | Deployment best practices | Deploy apps to Varity |
| `varity-auth.mdc` | Authentication setup | Social login, wallets |
| `varity-storage.mdc` | File storage operations | Upload, download, encryption |
| `varity-errors.mdc` | Error handling patterns | Robust error management |
| `varity-testing.mdc` | Testing strategies | Unit, integration, E2E tests |
| `varity-typescript.mdc` | TypeScript best practices | Type safety, type guards |
| `varity-performance.mdc` | Performance optimization | Bundle size, caching, lazy loading |
| `varity-contracts.mdc` | Smart contract integration | Blockchain (Advanced) |

## Usage

After installation, use Cursor's AI features:

1. Press `Cmd+K` (Mac) or `Ctrl+K` (Windows/Linux)
2. Ask questions about Varity development
3. Get context-aware code suggestions

### Example Prompts

**Deployment**:
```
Deploy my Next.js app to Varity with IPFS hosting
```

**Authentication**:
```
Add Google login to my Varity app
```

**Storage**:
```
Create a file uploader with validation and error handling
```

**TypeScript**:
```
Generate TypeScript types for Varity storage operations
```

## Documentation

Full documentation: [docs.varity.so/ai-tools](https://docs.varity.so/ai-tools/overview)

## Support

- **Discord**: [discord.gg/varity](https://discord.gg/varity) - #ai-tools
- **GitHub**: [github.com/varity-labs](https://github.com/varity-labs)
- **Docs**: [docs.varity.so](https://docs.varity.so)
