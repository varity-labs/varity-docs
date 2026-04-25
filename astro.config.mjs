// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

// https://astro.build/config
export default defineConfig({
  site: "https://docs.varity.so",
  output: "static",
  image: {
    // Use passthrough service to avoid sharp dependency issues on hosting platforms
    service: { entrypoint: 'astro/assets/services/noop' }
  },
  integrations: [
    starlight({
      title: "Varity Docs",
      description:
        "Build, deploy, and monetize apps with one command. 60-80% cheaper than AWS.",
      logo: {
        src: "./src/assets/varity-logo.svg",
        replacesTitle: false,
      },
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/varity-labs/varity-sdk",
        },
        {
          icon: "x.com",
          label: "X/Twitter",
          href: "https://x.com/VarityHQ",
        },
        {
          icon: "discord",
          label: "Discord",
          href: "https://discord.gg/7vWsdwa2Bg",
        },
      ],
      editLink: {
        baseUrl: "https://github.com/varity-labs/varity-docs/edit/main/",
      },
      components: {
        ContentPanel: './src/components/overrides/ContentPanel.astro',
        PageSidebar: './src/components/overrides/PageSidebar.astro',
      },
      customCss: [
        "./src/styles/varity-theme.css",
        "./src/styles/components.css"
      ],
      head: [
        // Performance: DNS prefetch for external resources
        {
          tag: "link",
          attrs: {
            rel: "dns-prefetch",
            href: "https://fonts.googleapis.com",
          },
        },
        {
          tag: "link",
          attrs: {
            rel: "dns-prefetch",
            href: "https://fonts.gstatic.com",
          },
        },
        {
          tag: "link",
          attrs: {
            rel: "preconnect",
            href: "https://fonts.googleapis.com",
          },
        },
        {
          tag: "link",
          attrs: {
            rel: "preconnect",
            href: "https://fonts.gstatic.com",
            crossorigin: "anonymous",
          },
        },
        // Performance: Browser's preload scanner handles critical resource discovery
        // (removed hardcoded preload tags - hashed filenames change on each build)
        {
          tag: "meta",
          attrs: {
            name: "theme-color",
            content: "#0f0f0f",
          },
        },
        {
          tag: "meta",
          attrs: {
            property: "og:type",
            content: "website",
          },
        },
        {
          tag: "meta",
          attrs: {
            property: "og:site_name",
            content: "Varity Docs",
          },
        },
        {
          tag: "meta",
          attrs: {
            name: "twitter:card",
            content: "summary_large_image",
          },
        },
        {
          tag: "meta",
          attrs: {
            name: "twitter:site",
            content: "@VarityHQ",
          },
        },
        {
          tag: "link",
          attrs: {
            rel: "icon",
            href: "/favicon.svg",
            type: "image/svg+xml",
          },
        },
      ],
      sidebar: [
        // ===== GET STARTED =====
        {
          label: "Get Started",
          items: [
            { label: "What is Varity?", slug: "getting-started/introduction" },
            {
              label: "Why Varity",
              slug: "getting-started/why-varity",
            },
            {
              label: "Deploy your first app",
              slug: "getting-started/quickstart",
            },
            {
              label: "Migrate from Vercel",
              slug: "deploy/vercel-migration",
            },
            {
              label: "Deploy an AI agent or LLM",
              slug: "tutorials/deploy-ai-agent",
            },
          ],
        },

        // ===== HOW TO USE VARITY =====
        {
          label: "How to Use Varity",
          items: [
            {
              label: "How Varity Works",
              slug: "getting-started/how-varity-works",
            },
            {
              label: "MCP Server (Claude Code / Cursor)",
              slug: "ai-tools/mcp-server-spec",
            },
            { label: "CLI (varitykit)", slug: "cli/overview" },
            {
              label: "AI Prompts",
              slug: "ai-tools/prompts",
            },
            {
              label: "Templates",
              collapsed: true,
              items: [
                { label: "Overview", slug: "templates/overview" },
                { label: "SaaS Starter", slug: "templates/saas-starter" },
              ],
            },
          ],
        },

        // ===== DEPLOYMENT =====
        {
          label: "Deployment",
          items: [
            {
              label: "Deploy Your App",
              slug: "deploy/deploy-your-app",
            },
            {
              label: "Supported Frameworks",
              slug: "deploy/supported-frameworks",
            },
            {
              label: "Auto-wired Services",
              slug: "deploy/auto-wired-services",
            },
            {
              label: "Environment Variables",
              slug: "deploy/env-variables",
            },
            {
              label: "Custom Domains",
              slug: "deploy/custom-domains",
            },
            {
              label: "Rollback",
              slug: "deploy/rollback",
            },
            {
              label: "Troubleshooting Deploys",
              slug: "deploy/deployment-troubleshooting",
            },
            {
              label: "Managed Credentials",
              slug: "deploy/managed-credentials",
            },
            {
              label: "Intelligent Orchestration",
              slug: "deploy/intelligent-orchestration",
            },
          ],
        },

        // ===== BUILD YOUR APP =====
        {
          label: "Build Your App",
          collapsed: true,
          items: [
            {
              label: "Authentication",
              collapsed: false,
              items: [
                { label: "Quick Start", slug: "build/auth/quickstart" },
                { label: "Email Login", slug: "build/auth/email-login" },
                { label: "Social Login", slug: "build/auth/social-login" },
              ],
            },
            {
              label: "Database",
              collapsed: false,
              items: [
                { label: "Quick Start", slug: "build/databases/quickstart" },
              ],
            },
            {
              label: "File Storage",
              collapsed: false,
              items: [
                { label: "Quick Start", slug: "build/storage/quickstart" },
                { label: "Upload Files", slug: "build/storage/upload" },
                { label: "Retrieve Files", slug: "build/storage/retrieve" },
              ],
            },
            {
              label: "Payments",
              collapsed: false,
              items: [
                {
                  label: "Quick Start",
                  slug: "build/payments/quickstart",
                },
                { label: "Credit Card Payments", slug: "build/payments/credit-card" },
              ],
            },
            {
              label: "Accounts",
              collapsed: true,
              items: [
                { label: "Quick Start", slug: "build/wallets/quickstart" },
                { label: "Create Account", slug: "build/wallets/create-wallet" },
              ],
            },
          ],
        },

        // ===== REFERENCE =====
        {
          label: "Reference",
          collapsed: true,
          items: [
            {
              label: "@varity-labs/sdk",
              collapsed: false,
              items: [
                { label: "Overview", slug: "packages/sdk/overview" },
                { label: "Installation", slug: "packages/sdk/installation" },
                { label: "Configuration", slug: "packages/sdk/chains" },
              ],
            },
            {
              label: "@varity-labs/ui-kit",
              collapsed: false,
              items: [
                { label: "Overview", slug: "packages/ui-kit/overview" },
                { label: "Installation", slug: "packages/ui-kit/installation" },
                { label: "Components", slug: "packages/ui-kit/components" },
                { label: "Hooks", slug: "packages/ui-kit/hooks" },
              ],
            },
            {
              label: "@varity-labs/types",
              collapsed: true,
              items: [
                { label: "Overview", slug: "packages/types/overview" },
              ],
            },
            {
              label: "CLI Commands",
              collapsed: true,
              items: [
                { label: "login / auth", slug: "cli/commands/auth" },
                { label: "doctor", slug: "cli/commands/doctor" },
                { label: "init", slug: "cli/commands/init" },
                { label: "deploy", slug: "cli/commands/deploy" },
              ],
            },
          ],
        },

        // ===== TUTORIALS =====
        {
          label: "Tutorials",
          collapsed: true,
          items: [
            {
              label: "Build a SaaS App",
              slug: "tutorials/build-saas-app",
            },
            { label: "Customize the Template", slug: "tutorials/customize-template" },
            { label: "Add a CRUD Feature", slug: "tutorials/add-crud-feature" },
            { label: "Build with AI (No Code)", slug: "tutorials/build-with-ai" },
            { label: "Framework Quick Starts", slug: "getting-started/quickstart-nextjs" },
          ],
        },

        // ===== PRICING & COSTS =====
        {
          label: "Pricing and Costs",
          items: [
            { label: "How pricing works", slug: "resources/pricing" },
            { label: "FAQ", slug: "resources/faq" },
          ],
        },

        // ===== HELP =====
        {
          label: "Help",
          items: [
            { label: "Troubleshooting", slug: "resources/troubleshooting" },
            { label: "Glossary", slug: "resources/glossary" },
            { label: "Getting Help", slug: "getting-started/getting-help" },
            { label: "App Store Guide", slug: "deploy/app-store" },
          ],
        },
      ],
    }),
  ],
});
