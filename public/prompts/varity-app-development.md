# Varity Development Rules

## What is Varity
Varity provides packages and a CLI for building, deploying, and monetizing applications.
Packages: @varity-labs/sdk, @varity-labs/ui-kit, @varity-labs/types
CLI: varitykit (Python, installed via pip)

## Core Packages

### @varity-labs/sdk
- `db` -- Database module. Usage: `import { db } from '@varity-labs/sdk'`
- `db.collection<T>('name')` -- Returns typed collection with .get(), .add(doc), .update(id, partial), .delete(id)
- `.get()` returns ALL documents -- filter client-side (no server-side filtering)

### @varity-labs/ui-kit
- `PrivyStack` -- Auth provider wrapper. Wrap your app root.
- `PrivyLoginButton` -- Drop-in login button (email, Google, Twitter, Discord, GitHub)
- `PrivyProtectedRoute` -- Wrapper that redirects unauthenticated users
- `PrivyUserProfile` -- User profile display component
- `usePrivy()` -- Hook returning `{ user, authenticated, logout, ready }`
- `DashboardLayout` -- Sidebar dashboard layout (desktop only, add mobile nav manually)

### @varity-labs/types
- TypeScript type definitions for all Varity interfaces

## Database Pattern: Type -> Collection -> Hook -> Page

### 1. Define TypeScript interface in `src/types/index.ts`
```typescript
export interface Customer {
  id?: string;          // Auto-generated, always optional
  name: string;
  email: string;
  plan: 'free' | 'pro' | 'enterprise';
  createdAt: string;    // ISO string
}
```

### 2. Create collection accessor in `src/lib/database.ts`
```typescript
import { db } from '@varity-labs/sdk';
import type { Customer } from '../types';
export const customers = () => db.collection<Customer>('customers');
```

### 3. Build React hook in `src/lib/hooks.ts`
```typescript
import { useState, useEffect, useCallback } from 'react';
import { customers } from './database';
import type { Customer } from '../types';

export function useCustomers() {
  const [data, setData] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const result = await customers().get();
      setData(result as Customer[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const create = async (input: Omit<Customer, 'id' | 'createdAt'>) => {
    const optimistic = { ...input, id: `temp-${Date.now()}`, createdAt: new Date().toISOString() };
    setData(prev => [optimistic, ...prev]);
    try {
      await customers().add({ ...input, createdAt: optimistic.createdAt });
      await refresh();
    } catch (err) {
      setData(prev => prev.filter(c => c.id !== optimistic.id));
      throw err;
    }
  };

  const update = async (id: string, changes: Partial<Customer>) => {
    const prev = data;
    setData(d => d.map(c => c.id === id ? { ...c, ...changes } : c));
    try {
      await customers().update(id, changes);
    } catch (err) {
      setData(prev);
      throw err;
    }
  };

  const remove = async (id: string) => {
    const prev = data;
    setData(d => d.filter(c => c.id !== id));
    try {
      await customers().delete(id);
    } catch (err) {
      setData(prev);
      throw err;
    }
  };

  return { data, loading, error, create, update, remove, refresh };
}
```

### 4. Use hook in page component
```tsx
'use client';
import { useCustomers } from '../../lib/hooks';

export default function CustomersPage() {
  const { data, loading, error, create, remove } = useCustomers();

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>Customers ({data.length})</h1>
      {data.map(c => (
        <div key={c.id}>
          <span>{c.name} - {c.email} ({c.plan})</span>
          <button onClick={() => remove(c.id!)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
```

## Auth Pattern
```tsx
// Layout: Set up auth provider
import { PrivyStack } from '@varity-labs/ui-kit';

<PrivyStack appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID}>
  {children}
</PrivyStack>

// Protected page: Wrap with route protection
import { PrivyProtectedRoute } from '@varity-labs/ui-kit';

<PrivyProtectedRoute>
  <DashboardContent />
</PrivyProtectedRoute>

// Get user info
import { usePrivy } from '@varity-labs/ui-kit';

const { user, authenticated, logout } = usePrivy();
const email = user?.email?.address;
```

## CLI Commands
- `pip install varitykit` -- Install the CLI
- `varitykit doctor` -- Check environment setup
- `varitykit init [name]` -- Scaffold new project from template
- `varitykit app deploy` -- Deploy app (auto-detects static/dynamic)
- `varitykit app deploy --submit-to-store` -- Deploy and submit to App Store
- `varitykit app list` -- List your deployments

## Environment Variables (Next.js)
```
NEXT_PUBLIC_PRIVY_APP_ID=         # Auth (optional for dev, shared creds used)
NEXT_PUBLIC_VARITY_APP_ID=        # Your app ID (after deploy)
```

## Key Rules
<<<<<<< HEAD
- NEVER use blockchain/crypto terminology in user-facing code
=======
- NEVER use technical infrastructure terminology in user-facing code
>>>>>>> e29b089d895ea4e653849a742d38ee6ad100199c
- Use TypeScript interfaces for all data models
- Use optimistic UI updates in hooks (update state first, then API, rollback on error)
- Use `'use client'` directive for hooks and interactive components
- DashboardLayout has NO mobile support -- implement mobile nav manually
- Database credentials are auto-injected at deploy time by the CLI
- For local dev, set NEXT_PUBLIC_VARITY_APP_TOKEN and NEXT_PUBLIC_VARITY_DB_PROXY_URL in .env.local, or build UI with mock data first
- .get() returns all docs -- filter on client side (no server-side filtering)
- `id` is always `string | undefined` -- Varity generates it
- Use ISO strings for dates (`new Date().toISOString()`)
- Collection names should be snake_case plural (customers, order_items)
- Use `output: 'export'` in next.config.js for static hosting
- No dynamic routes ([id]) -- use client-side state for detail views
