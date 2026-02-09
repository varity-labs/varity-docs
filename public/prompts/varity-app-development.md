# Varity App Development Prompt

## What is Varity
Varity provides packages and a CLI for building, deploying, and monetizing applications.
Packages: @varity-labs/sdk, @varity-labs/ui-kit, @varity-labs/types
CLI: varitykit (Python, installed via pip)

## Core Packages

### @varity-labs/sdk
- `db` — Database module. Usage: `import { db } from '@varity-labs/sdk'`
- `db.collection<T>('name')` — Returns typed collection
- Collection methods: .add(data), .get(options?), .update(id, data), .delete(id)
- .get() options: { limit?, offset?, orderBy? } — NO server-side filtering
- Filter on client side: `(await collection.get()).filter(item => ...)`

### @varity-labs/ui-kit
- `PrivyStack` — Auth provider wrapper. Wrap your app root.
- `PrivyLoginButton` — Drop-in login button (email, Google, Twitter, Discord, GitHub)
- `PrivyProtectedRoute` — Wrapper that redirects unauthenticated users
- `PrivyUserProfile` — User profile display component
- `usePrivy()` — Hook returning { user, authenticated, logout, ready }
- `DashboardLayout` — Sidebar dashboard layout (desktop only, add mobile nav manually)

## Database Pattern
1. Define TypeScript interface in `src/types/index.ts`
2. Create collection accessor in `src/lib/database.ts`:
   ```typescript
   import { db } from '@varity-labs/sdk';
   import type { MyType } from '../types';
   export const myItems = () => db.collection<MyType>('my_items');
   ```
3. Build React hook in `src/lib/hooks.ts` with:
   - useState for data, loading, error
   - useCallback + useEffect for initial fetch via collection().get()
   - Optimistic create/update/delete with rollback on error
4. Use hook in page component

## Auth Pattern
```tsx
// Layout: Wrap app with PrivyStack
<PrivyStack appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID}>
  {children}
</PrivyStack>

// Protected page: Wrap with PrivyProtectedRoute
<PrivyProtectedRoute>
  <DashboardContent />
</PrivyProtectedRoute>

// Get user info
const { user, authenticated, logout } = usePrivy();
const email = user?.email?.address;
```

## CLI Commands
- `varitykit doctor` — Check environment setup
- `varitykit init` — Scaffold new project from template
- `varitykit app deploy` — Deploy app (auto-detects static/dynamic)
- `varitykit app deploy --submit-to-store` — Deploy and submit to App Store

## Credential Injection
- CLI auto-generates app_id + JWT token at deploy time
- Written to .env.local, compiled into build, then deleted
- For local dev: set env vars manually or build UI with mock data first

## Environment Variables (Next.js)
```
NEXT_PUBLIC_PRIVY_APP_ID=         # Auth (optional for dev, shared creds used)
NEXT_PUBLIC_VARITY_APP_ID=        # Your app ID (after deploy)
NEXT_PUBLIC_VARITY_APP_TOKEN=     # JWT for DB access (auto-generated at deploy)
NEXT_PUBLIC_VARITY_DB_PROXY_URL=  # DB proxy URL (auto-injected at deploy)
```

## Key Rules
- NEVER use blockchain/crypto terminology in user-facing code
- Use TypeScript interfaces for all data models
- Use optimistic UI updates in hooks
- Use `'use client'` directive for hooks and interactive components
- DashboardLayout has NO mobile support — implement mobile nav manually
- .get() returns ALL docs — filter on client side (no server-side filtering)
