# Contributing to Varity Documentation

Thank you for your interest in contributing to Varity's documentation! This guide will help you get started.

## Quick Links

- [Code of Conduct](https://github.com/varity-labs/.github/blob/main/CODE_OF_CONDUCT.md)
- [Documentation Site](https://docs.varity.so)
- [GitHub Repository](https://github.com/varity-labs/varity-docs)

## How to Contribute

We welcome contributions of all kinds:

- Fix typos or unclear explanations
- Add missing documentation
- Improve code examples
- Add new guides or tutorials
- Report broken links or outdated information

## Getting Started

### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then:
git clone https://github.com/YOUR_USERNAME/varity-docs.git
cd varity-docs
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
# Open http://localhost:4321 in your browser
```

### 4. Make Your Changes

Edit files in `src/content/docs/`. The site will hot-reload as you make changes.

### 5. Test Your Changes

- Verify the page renders correctly in your browser
- Check that all code examples work (copy-paste and test them)
- Run the build to catch any errors:

```bash
npm run build
```

### 6. Submit a Pull Request

```bash
git checkout -b my-contribution
git add .
git commit -m "docs: your descriptive commit message"
git push origin my-contribution
```

Then open a pull request on GitHub with a clear description of your changes.

## Documentation Standards

### Page Structure

Every documentation page should include:

1. **Frontmatter** - Metadata at the top of the file
2. **Title** - Clear H1 heading
3. **Introduction** - Brief overview of what the page covers
4. **Main Content** - The actual documentation
5. **Next Steps** - Links to related pages (when appropriate)

### Frontmatter Format

All MDX files must include frontmatter:

```mdx
---
title: "Your Page Title"
description: "Brief description under 160 characters for SEO."
---
```

**Guidelines:**
- `title`: Clear, specific, under 60 characters
- `description`: One-sentence summary, under 160 characters

### Headings

- Use **H1** (`#`) for the page title only (one per page)
- Use **H2** (`##`) for major sections
- Use **H3** (`###`) for subsections
- Use sentence case: "Getting started" not "Getting Started"
- Don't skip heading levels

### Writing Style

- **Be concise** - Developers are busy; get to the point
- **Use active voice** - "Click the button" not "The button should be clicked"
- **Be specific** - "Takes 30 seconds" not "Takes some time"
- **Use second person** - "You can deploy" not "Users can deploy"
- **Avoid jargon** - Or explain it clearly when needed

### MDX Components

We use [Starlight components](https://starlight.astro.build/guides/components/) for enhanced documentation. Import them at the top of your MDX file:

```mdx
import { Aside, Steps, Tabs, TabItem, Card, CardGrid } from '@astrojs/starlight/components';
```

#### Aside (Callouts)

Use for tips, warnings, notes, and cautions:

```mdx
:::tip
This is a helpful tip!
:::

:::caution
This is a warning about something important.
:::

:::note
This is additional information.
:::

:::danger
This is a critical warning.
:::
```

#### Steps

Use for sequential instructions:

```mdx
<Steps>

1. First step with explanation

   Code example if needed

2. Second step with explanation

3. Third step with explanation

</Steps>
```

#### Tabs

Use for showing multiple options (npm/yarn/pnpm, different frameworks, etc.):

```mdx
<Tabs>
  <TabItem label="npm">
    ```bash
    npm install @varity/sdk
    ```
  </TabItem>
  <TabItem label="yarn">
    ```bash
    yarn add @varity/sdk
    ```
  </TabItem>
  <TabItem label="pnpm">
    ```bash
    pnpm add @varity/sdk
    ```
  </TabItem>
</Tabs>
```

#### Cards

Use for visual grouping of related links:

```mdx
<CardGrid>
  <Card title="Authentication" icon="lock">
    Add login to your app
  </Card>
  <Card title="Storage" icon="database">
    Upload and retrieve files
  </Card>
</CardGrid>
```

## Code Example Guidelines

### Critical Rule: Every Example Must Work

Before publishing any code example:

1. Create a test project
2. Copy-paste the exact code from your docs
3. Verify it compiles and runs
4. Verify it produces the expected output

**Zero tolerance for broken code examples.**

### Include All Imports

Always show the full imports at the top of code blocks:

```typescript
import { createClient } from '@varity/sdk';

const client = createClient({ chainId: 33529 });
```

### Use Realistic Values

Use environment variables for secrets and realistic IDs:

```typescript
// Good
const client = createClient({ appId: process.env.VARITY_APP_ID! });
const user = await getUser('user_2NffrFeUfNV2Hib');

// Bad - placeholders don't help
const client = createClient({ appId: 'YOUR_APP_ID' });
const user = await getUser('USER_ID');
```

### Specify Language

Always include the language identifier:

````markdown
```typescript
// TypeScript code
```

```bash
# Shell commands
```

```json
{
  "json": "data"
}
```
````

### Include File Names

When code belongs to a specific file:

````markdown
```typescript title="src/app.tsx"
// Your code here
```
````

### Show Expected Output

When relevant, show what the code produces:

```typescript
const user = await getUser('user_123');
console.log(user);
// Output:
// {
//   id: 'user_123',
//   email: 'jenny@example.com',
//   createdAt: '2026-01-28T10:30:00Z'
// }
```

### Complete React Components

Show full, runnable components, not just snippets:

```tsx
import { useWalletAuth } from '@varity/ui-kit';

function LoginButton() {
  const { login, isAuthenticated, isLoading } = useWalletAuth();

  if (isLoading) return <button disabled>Loading...</button>;
  if (isAuthenticated) return <span>Logged in!</span>;

  return <button onClick={() => login()}>Log In</button>;
}

export default LoginButton;
```

## Terminology

Use consistent terminology throughout:

| Use | Instead of |
|-----|------------|
| App | Application, dApp |
| Deploy | Ship, Launch |
| Log in / Log out | Login / Logout (as verbs) |
| Set up (verb) | Setup (as verb) |
| Smart wallet | Smart account |
| Gasless | Gas-free, no-gas |

### Capitalization

- **Varity** - Always capitalized
- **VarietyKit** - Camel case
- **Web3** - Capital W, lowercase eb3
- **TypeScript / JavaScript** - Official casing

## Testing Locally

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Visit `http://localhost:4321` to see your changes.

## Pull Request Guidelines

### Commit Messages

Use clear, descriptive commit messages:

- `docs: add authentication guide`
- `docs: fix typo in storage examples`
- `docs: update CLI installation steps`

### PR Description

Include in your PR description:

1. What changed and why
2. Screenshots (if visual changes)
3. Checklist of what you tested

### Before Submitting

- [ ] All code examples are tested and working
- [ ] Spelling and grammar are correct
- [ ] Links are valid and working
- [ ] Page renders correctly in browser
- [ ] Build completes without errors (`npm run build`)
- [ ] Follows the style guide

## Need Help?

- **Questions?** Open a [GitHub Discussion](https://github.com/varity-labs/varity-docs/discussions)
- **Bug Report?** Open an [Issue](https://github.com/varity-labs/varity-docs/issues)
- **Chat?** Join our [Discord](https://discord.gg/Uhjx6yhJ)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for helping make Varity's documentation better!
