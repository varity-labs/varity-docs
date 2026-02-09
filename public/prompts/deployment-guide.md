# Varity Deployment Prompt

## Prerequisites
- pip install varitykit
- Node.js 18+
- A built React/Next.js app

## Deploy (static hosting)
```bash
npm run build
varitykit app deploy
```

## Deploy and submit to App Store
```bash
npm run build
varitykit app deploy --submit-to-store
```

## What happens at deploy time
1. CLI analyzes your source code for database/auth usage
2. If database detected: generates app_id + JWT token + db proxy URL
3. Creates temporary .env.local with credentials (all framework prefixes)
4. Builds your app (env vars compiled in)
5. Uploads built app to hosting
6. Deletes .env.local (credentials embedded in build output)
7. If --submit-to-store: opens Developer Portal in browser

## Environment Variables
Set in .env.local for development. At deploy time, credentials are auto-generated.
```
NEXT_PUBLIC_PRIVY_APP_ID=         # Optional for dev (shared creds)
NEXT_PUBLIC_VARITY_APP_ID=        # Set after first deploy
NEXT_PUBLIC_VARITY_APP_TOKEN=     # JWT for DB (auto-generated at deploy)
NEXT_PUBLIC_VARITY_DB_PROXY_URL=  # DB proxy URL (auto-injected at deploy)
```

## Check environment
```bash
varitykit doctor
```

## Common Issues
- "Module not found": Run npm install @varity-labs/sdk @varity-labs/ui-kit @varity-labs/types
- "CLI not found": Run pip install varitykit
- Build errors: Set `typescript: { ignoreBuildErrors: true }` in next.config.js
- Static export: Use `output: 'export'` in next.config.js. No dynamic routes ([id]).
- Database not working in dev: Set NEXT_PUBLIC_VARITY_APP_TOKEN and NEXT_PUBLIC_VARITY_DB_PROXY_URL in .env.local
