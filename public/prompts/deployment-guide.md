# Varity Deployment Guide

## Prerequisites
- Python 3.8+ installed
- Node.js 18+ installed
- A built React/Next.js app
- varitykit CLI installed: `pip install varitykit`

## Step 1: Check Your Environment
```bash
varitykit doctor
```
This verifies that all required tools are installed and configured correctly.

## Step 2: Build Your App
```bash
npm run build
```
Make sure your Next.js config uses static export:
```javascript
// next.config.js
const nextConfig = {
  output: 'export',
  typescript: {
    ignoreBuildErrors: true,  // Optional: skip type errors during build
  },
};
module.exports = nextConfig;
```

## Step 3: Deploy
```bash
varitykit app deploy
```
The CLI auto-detects your app type (static or dynamic) and deploys accordingly.

Your app will be live at a URL like: `https://your-app.varity.app`

## Step 4: Deploy and Submit to App Store
```bash
varitykit app deploy --submit-to-store
```
This deploys your app AND opens the Varity App Store submission page in your browser. The App Store uses a 90/10 revenue split (90% to you, 10% to Varity).

## Step 5: Check Your Deployments
```bash
varitykit app list
```
Lists all your deployed apps with their URLs and status.

## Environment Variables

Set these in `.env.local` for local development. On deploy, credentials are injected automatically by the CLI.

```
NEXT_PUBLIC_PRIVY_APP_ID=         # Auth provider (optional for dev -- shared creds used)
NEXT_PUBLIC_VARITY_APP_ID=        # Your app ID (set after first deploy)
```

For local database access during development:
```
NEXT_PUBLIC_VARITY_APP_TOKEN=     # Database auth token
NEXT_PUBLIC_VARITY_DB_PROXY_URL=  # Database proxy endpoint
```

## CLI Command Reference
| Command | Description |
|---------|-------------|
| `varitykit doctor` | Check environment setup |
| `varitykit init [name]` | Scaffold a new project from template |
| `varitykit app deploy` | Deploy to production |
| `varitykit app deploy --submit-to-store` | Deploy + submit to App Store |
| `varitykit app list` | List your deployments |

## Common Issues and Fixes

### "Module not found" errors
Install all Varity packages:
```bash
npm install @varity-labs/sdk @varity-labs/ui-kit @varity-labs/types
```

### "varitykit: command not found"
Install the CLI:
```bash
pip install varitykit
```

### Build errors with TypeScript
Add to next.config.js:
```javascript
typescript: { ignoreBuildErrors: true }
```

### Static export issues
- Use `output: 'export'` in next.config.js
- No dynamic routes (e.g., `[id]`) -- use client-side state instead
- No server-side features (API routes, getServerSideProps)

### Deploy fails
1. Run `varitykit doctor` to check your environment
2. Make sure `npm run build` succeeds locally
3. Check that `out/` directory exists (Next.js static export output)

## Full Deploy Workflow Example
```bash
# 1. Install CLI (one time)
pip install varitykit

# 2. Check environment
varitykit doctor

# 3. Install dependencies
npm install

# 4. Build
npm run build

# 5. Deploy
varitykit app deploy

# 6. (Optional) Deploy and submit to App Store
varitykit app deploy --submit-to-store

# 7. Verify
varitykit app list
```
