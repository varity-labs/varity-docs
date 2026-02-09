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
        "Build, deploy, and monetize apps with one command. 70-85% cheaper than AWS.",
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
          href: "https://discord.gg/Uhjx6yhJ",
        },
      ],
      editLink: {
        baseUrl: "https://github.com/varity-labs/varity-docs/edit/main/",
      },
      customCss: [
        "./src/styles/varity-theme.css",
        "./src/styles/components.css"
      ],
      head: [
        {
          tag: "meta",
          attrs: {
            name: "theme-color",
            content: "#0f0f0f",
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
        // ===== GETTING STARTED =====
        {
          label: "Getting Started",
          items: [
            { label: "Introduction", slug: "getting-started/introduction" },
            { label: "Installation", slug: "getting-started/installation" },
            {
              label: "Quick Start",
              slug: "getting-started/quickstart",
              badge: { text: "Recommended", variant: "success" },
            },
            {
              label: "Next.js Quick Start",
              slug: "getting-started/quickstart-nextjs",
              badge: { text: "New", variant: "success" },
            },
            {
              label: "React Quick Start",
              slug: "getting-started/quickstart-react",
              badge: { text: "New", variant: "success" },
            },
          ],
        },

        // ===== TEMPLATES =====
        {
          label: "Templates",
          badge: { text: "New", variant: "success" },
          items: [
            { label: "Overview", slug: "templates/overview" },
            {
              label: "SaaS Starter",
              slug: "templates/saas-starter",
              badge: { text: "Recommended", variant: "success" },
            },
          ],
        },

        // ===== PACKAGES =====
        {
          label: "Packages",
          items: [
            {
              label: "@varity/sdk",
              collapsed: false,
              items: [
                { label: "Overview", slug: "packages/sdk/overview" },
                { label: "Installation", slug: "packages/sdk/installation" },
                { label: "Configuration", slug: "packages/sdk/chains" },
              ],
            },
            {
              label: "@varity/ui-kit",
              collapsed: false,
              items: [
                { label: "Overview", slug: "packages/ui-kit/overview" },
                { label: "Installation", slug: "packages/ui-kit/installation" },
                { label: "Components Reference", slug: "packages/ui-kit/components" },
                { label: "Hooks Reference", slug: "packages/ui-kit/hooks" },
              ],
            },
            {
              label: "@varity/types",
              collapsed: true,
              items: [
                { label: "Overview", slug: "packages/types/overview" },
              ],
            },
          ],
        },

        // ===== BUILD YOUR APP =====
        {
          label: "Build Your App",
          items: [
            // ----- AUTHENTICATION -----
            {
              label: "Authentication",
              collapsed: false,
              items: [
                {
                  label: "Quick Start (Privy)",
                  slug: "build/auth/quickstart",
                  badge: { text: "Recommended", variant: "success" },
                },
                { label: "Email Login", slug: "build/auth/email-login" },
                { label: "Social Login", slug: "build/auth/social-login" },
              ],
            },

            // ----- DATABASE -----
            {
              label: "Database",
              collapsed: false,
              items: [
                {
                  label: "Quick Start",
                  slug: "build/databases/quickstart",
                  badge: { text: "Updated", variant: "success" },
                },
              ],
            },

            // ----- FILE STORAGE -----
            {
              label: "File Storage",
              collapsed: false,
              items: [
                {
                  label: "Quick Start",
                  slug: "build/storage/quickstart",
                  badge: { text: "Recommended", variant: "success" },
                },
                { label: "Upload Files", slug: "build/storage/upload" },
                { label: "Retrieve Files", slug: "build/storage/retrieve" },
              ],
            },

            // ----- PAYMENTS -----
            {
              label: "Payments",
              collapsed: false,
              items: [
                {
                  label: "Quick Start",
                  slug: "build/payments/quickstart",
                  badge: { text: "Beta", variant: "note" },
                },
                { label: "Credit Card Payments", slug: "build/payments/credit-card" },
                { label: "Free Operations", slug: "build/payments/gasless" },
              ],
            },

            // ----- SMART ACCOUNTS -----
            {
              label: "Smart Accounts",
              collapsed: true,
              items: [
                {
                  label: "Quick Start",
                  slug: "build/wallets/quickstart",
                },
                { label: "Create Account", slug: "build/wallets/create-wallet" },
                { label: "Session Keys", slug: "build/wallets/session-keys" },
              ],
            },

            // ----- COMPUTE (COMING SOON) -----
            {
              label: "Compute & Hosting",
              badge: { text: "Coming Soon", variant: "caution" },
              collapsed: true,
              items: [
                { label: "Overview", slug: "build/compute/overview" },
              ],
            },
          ],
        },

        // ===== CLI =====
        {
          label: "CLI",
          items: [
            { label: "Overview", slug: "cli/overview" },
            { label: "Installation", slug: "cli/installation" },
            {
              label: "Commands",
              collapsed: false,
              items: [
                { label: "doctor", slug: "cli/commands/doctor" },
                { label: "init", slug: "cli/commands/init" },
                { label: "deploy", slug: "cli/commands/deploy" },
              ],
            },
          ],
        },

        // ===== DEPLOY =====
        {
          label: "Deploy",
          items: [
            {
              label: "Deploy Your App",
              slug: "deploy/varity-l3",
              badge: { text: "Beta", variant: "note" },
            },
            { label: "Managed Credentials", slug: "deploy/managed-credentials" },
            { label: "Environment Variables", slug: "deploy/env-variables" },
          ],
        },

        // ===== TUTORIALS =====
        {
          label: "Tutorials",
          badge: { text: "New", variant: "success" },
          items: [
            {
              label: "Build & Deploy a SaaS App",
              slug: "tutorials/build-saas-app",
              badge: { text: "Recommended", variant: "success" },
            },
            { label: "Customize the Template", slug: "tutorials/customize-template" },
            { label: "Add a CRUD Feature", slug: "tutorials/add-crud-feature" },
          ],
        },

        // ===== AI TOOLS =====
        {
          label: "AI Tools",
          items: [
            { label: "Overview", slug: "ai-tools/overview" },
            {
              label: "AI Prompts",
              slug: "ai-tools/prompts",
              badge: { text: "New", variant: "success" },
            },
            {
              label: "MCP Server Spec",
              slug: "ai-tools/mcp-server-spec",
              badge: { text: "Coming Soon", variant: "caution" },
            },
          ],
        },

        // ===== RESOURCES =====
        {
          label: "Resources",
          items: [
            { label: "FAQ", slug: "resources/faq" },
            { label: "Glossary", slug: "resources/glossary" },
            { label: "Troubleshooting", slug: "resources/troubleshooting" },
          ],
        },
      ],
    }),
  ],
});
