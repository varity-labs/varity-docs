# Customizing the Varity SaaS Template Prompt

## Template structure
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
│   ├── varity.ts          # SDK import (export { db } from '@varity-labs/sdk')
│   ├── database.ts        # Collection helpers
│   ├── hooks.ts           # React hooks for data
│   └── constants.ts       # App name, navigation items
├── types/
│   └── index.ts           # TypeScript interfaces
└── components/ui/         # Shared UI components
```

## Change branding
1. `src/lib/constants.ts` — Change APP_NAME
2. `src/app/globals.css` — Change CSS variables (:root { --color-primary-* })
3. `tailwind.config.js` — Colors reference CSS variables

## Add a new page
1. Create `src/app/dashboard/new-page/page.tsx`
2. Add to NAVIGATION_ITEMS in `src/lib/constants.ts`
3. Available icons: dashboard, folder, list, people, settings

## Add a new data model
1. Define interface in `src/types/index.ts`
2. Add collection in `src/lib/database.ts`:
   `export const items = () => db.collection<Item>('items')`
3. Create hook in `src/lib/hooks.ts` (copy useProjects pattern — optimistic updates)
4. Build page component using the hook

## Database API (accurate)
- .add(data) — Insert a document
- .get(options?) — Get all documents (options: limit, offset, orderBy)
- .update(id, data) — Update by ID
- .delete(id) — Delete by ID
- NO .find() method — filter on client side after .get()

## Navigation
Edit NAVIGATION_ITEMS in constants.ts:
```typescript
{ label: 'My Page', icon: 'star', path: '/dashboard/my-page' }
```
