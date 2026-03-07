# Customizing the Varity SaaS Template

## Template Structure
```
src/
├── app/                    # Next.js pages
│   ├── page.tsx           # Landing page
│   ├── login/page.tsx     # Login page
│   └── dashboard/
│       ├── layout.tsx     # Dashboard layout (sidebar + mobile nav)
│       ├── page.tsx       # Dashboard home
│       ├── projects/      # Projects CRUD
│       ├── tasks/         # Tasks CRUD
│       ├── team/          # Team management
│       └── settings/      # Settings
├── lib/
│   ├── varity.ts          # SDK import (1 line: export { db } from '@varity-labs/sdk')
│   ├── database.ts        # Collection helpers
│   ├── hooks.ts           # React hooks for data
│   └── constants.ts       # App name, navigation items
├── types/
│   └── index.ts           # TypeScript interfaces
└── components/ui/         # Shared UI components
```

## Change Branding

### 1. Update app name and metadata
Edit `src/lib/constants.ts`:
```typescript
export const APP_NAME = 'YourAppName';
export const APP_DESCRIPTION = 'Your app description';
```

### 2. Update colors
Edit `src/app/globals.css` -- change the CSS variables in `:root`:
```css
:root {
  --color-primary-50: #f5f3ff;
  --color-primary-100: #ede9fe;
  --color-primary-200: #ddd6fe;
  --color-primary-300: #c4b5fd;
  --color-primary-400: #a78bfa;
  --color-primary-500: #8b5cf6;   /* Main brand color */
  --color-primary-600: #7c3aed;
  --color-primary-700: #6d28d9;
  --color-primary-800: #5b21b6;
  --color-primary-900: #4c1d95;
}
```
Tailwind references these CSS variables automatically, so all components update.

### 3. Update landing page
Edit `src/app/page.tsx` to change headlines, feature descriptions, and CTAs.

## Add a New Page

### 1. Create the page file
```tsx
// src/app/dashboard/workflows/page.tsx
'use client';
import { useWorkflows } from '../../../lib/hooks';

export default function WorkflowsPage() {
  const { data, loading, error, create, remove } = useWorkflows();

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>Workflows</h1>
      {data.map(w => (
        <div key={w.id}>
          <span>{w.name} - {w.status}</span>
          <button onClick={() => remove(w.id!)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
```

### 2. Add to navigation
Edit `src/lib/constants.ts`:
```typescript
export const NAVIGATION_ITEMS = [
  { label: 'Dashboard', icon: 'dashboard', path: '/dashboard' },
  { label: 'Workflows', icon: 'list', path: '/dashboard/workflows' },
  { label: 'Team', icon: 'people', path: '/dashboard/team' },
  { label: 'Settings', icon: 'settings', path: '/dashboard/settings' },
];
```
Available icons: dashboard, folder, list, people, settings, star

## Add a New Data Model

Follow the Type -> Collection -> Hook -> Page pattern:

### 1. Define the interface
```typescript
// src/types/index.ts
export interface Workflow {
  id?: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  ownerId: string;
  createdAt: string;
}
```

### 2. Add collection accessor
```typescript
// src/lib/database.ts
import { db } from '@varity-labs/sdk';
import type { Workflow } from '../types';

export const workflows = () => db.collection<Workflow>('workflows');
```

### 3. Create the hook
```typescript
// src/lib/hooks.ts
import { workflows } from './database';
import type { Workflow } from '../types';

export function useWorkflows() {
  const [data, setData] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const result = await workflows().get();
      setData(result as Workflow[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const create = async (input: Omit<Workflow, 'id' | 'createdAt'>) => {
    const optimistic = { ...input, id: `temp-${Date.now()}`, createdAt: new Date().toISOString() };
    setData(prev => [optimistic, ...prev]);
    try {
      await workflows().add({ ...input, createdAt: optimistic.createdAt });
      await refresh();
    } catch (err) {
      setData(prev => prev.filter(w => w.id !== optimistic.id));
      throw err;
    }
  };

  const update = async (id: string, changes: Partial<Workflow>) => {
    const prev = data;
    setData(d => d.map(w => w.id === id ? { ...w, ...changes } : w));
    try {
      await workflows().update(id, changes);
    } catch (err) {
      setData(prev);
      throw err;
    }
  };

  const remove = async (id: string) => {
    const prev = data;
    setData(d => d.filter(w => w.id !== id));
    try {
      await workflows().delete(id);
    } catch (err) {
      setData(prev);
      throw err;
    }
  };

  return { data, loading, error, create, update, remove, refresh };
}
```

### 4. Build the page (see "Add a New Page" above)

## Replace an Existing Feature

To replace "Projects" with "Workflows":

1. Update `src/types/index.ts` -- replace `Project` interface with `Workflow`
2. Update `src/lib/database.ts` -- replace `projects()` with `workflows()`
3. Update `src/lib/hooks.ts` -- replace `useProjects()` with `useWorkflows()`
4. Rename `src/app/dashboard/projects/` to `src/app/dashboard/workflows/`
5. Update the page component to use `useWorkflows()`
6. Update `NAVIGATION_ITEMS` in `src/lib/constants.ts`

## Auth Components Available
```tsx
import {
  PrivyStack,           // Auth provider (wrap app root)
  PrivyLoginButton,     // Drop-in login button
  PrivyProtectedRoute,  // Route protection wrapper
  PrivyUserProfile,     // User profile display
  DashboardLayout,      // Sidebar layout
} from '@varity-labs/ui-kit';
import { usePrivy } from '@varity-labs/ui-kit';

const { user, authenticated, logout, ready } = usePrivy();
```

## Rules
- Always use `'use client'` directive for pages with hooks or interactivity
- Follow the Type -> Collection -> Hook -> Page pattern for all data models
- Keep collection names snake_case plural (workflows, team_members)
- Use optimistic updates in all hooks
- DashboardLayout has no mobile support -- implement mobile nav manually
- Use `output: 'export'` in next.config.js (static hosting)
- No dynamic routes ([id]) -- use client-side state for detail views
