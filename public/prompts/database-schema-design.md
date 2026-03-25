# Varity Database Design Rules

## API
- Import: `import { db } from '@varity-labs/sdk'`
- Collection: `db.collection<T>('collection_name')` -- returns typed collection
- Operations: `.get()`, `.add(doc)`, `.update(id, partial)`, `.delete(id)`
- `.get()` returns ALL documents -- filter on client side

## Pattern: Type -> Collection -> Hook -> Page

### Step 1: Define the type
```typescript
// src/types/index.ts
export interface Customer {
  id?: string;          // Auto-generated, always optional
  name: string;
  email: string;
  plan: 'free' | 'pro' | 'enterprise';
  createdAt: string;    // ISO string
}
```

### Step 2: Create collection accessor
```typescript
// src/lib/database.ts
import { db } from '@varity-labs/sdk';
import type { Customer } from '../types';
export const customers = () => db.collection<Customer>('customers');
```

### Step 3: Build hook with optimistic updates
```typescript
// src/lib/hooks.ts
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

### Step 4: Use in a page component
```tsx
// src/app/dashboard/customers/page.tsx
'use client';
import { useCustomers } from '../../../lib/hooks';

export default function CustomersPage() {
  const { data, loading, error, create, remove } = useCustomers();

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>Customers ({data.length})</h1>
      <ul>
        {data.map(c => (
          <li key={c.id}>
            {c.name} ({c.email}) - {c.plan}
            <button onClick={() => remove(c.id!)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## Multiple Collections Example
```typescript
// src/types/index.ts
export interface Project {
  id?: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'completed';
  ownerId: string;
  createdAt: string;
}

export interface Task {
  id?: string;
  projectId: string;    // Reference to parent project
  title: string;
  completed: boolean;
  assignee: string;
  createdAt: string;
}

// src/lib/database.ts
import { db } from '@varity-labs/sdk';
import type { Project, Task } from '../types';

export const projects = () => db.collection<Project>('projects');
export const tasks = () => db.collection<Task>('tasks');
```

## Filtering (Client-Side)
```typescript
// .get() returns all documents. Filter in your hook or component:
const allTasks = await tasks().get() as Task[];

// Filter by project
const projectTasks = allTasks.filter(t => t.projectId === projectId);

// Filter by status
const activeTasks = allTasks.filter(t => !t.completed);

// Search by name
const matches = allTasks.filter(t =>
  t.title.toLowerCase().includes(searchTerm.toLowerCase())
);
```

## Rules
- `id` is always `string | undefined` -- Varity generates it automatically
- Use ISO strings for dates (`new Date().toISOString()`)
- Collection names should be snake_case plural (customers, order_items, team_members)
- Keep interfaces flat -- avoid deeply nested objects
- Filter on client side: `data.filter(item => item.projectId === id)`
- Use `Omit<Type, 'id' | 'createdAt'>` for create inputs (Varity handles id, you set createdAt)
- Always use optimistic updates: update local state first, then call the API, rollback on error
- Use `'use client'` directive on any file that uses hooks
