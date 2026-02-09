# Varity Database Schema Design Prompt

## API
- Import: `import { db } from '@varity-labs/sdk'`
- Collection: `db.collection<T>('collection_name')` — returns typed collection
- Methods: .add(data), .get(options?), .update(id, partial), .delete(id)
- .get() options: { limit?, offset?, orderBy? } — NO server-side filtering
- Filter on client side after .get()

## Pattern: Type -> Collection -> Hook -> Page

### Step 1: Define the type
```typescript
// src/types/index.ts
export interface Customer {
  id?: string;          // Auto-generated UUID, always optional
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

  // update and remove follow same optimistic pattern
  return { data, loading, error, create, update, remove, refresh };
}
```

## Rules
- `id` is always `string | undefined` — Varity generates a UUID
- Use ISO strings for dates (new Date().toISOString())
- Collection names: snake_case plural (customers, order_items)
- Keep interfaces flat — no nested objects
- Filter on client side: `data.filter(item => item.projectId === id)`
- .get() returns ALL docs — use { limit, offset } for pagination
