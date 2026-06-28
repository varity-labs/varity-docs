// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://docs.varity.so",
  output: "static",
  image: {
    // Use passthrough service to avoid sharp dependency issues on hosting platforms
    service: { entrypoint: 'astro/assets/services/noop' }
  },
  integrations: [
    sitemap({
      filter: (page) =>
        ![
          "https://docs.varity.so/build/deploy/",
          "https://docs.varity.so/introduction/",
        ].includes(page),
    }),
    starlight({
      title: "Varity Docs",
      description:
        "Build and deploy supported apps with predictable cloud hosting.",
      logo: {
        src: "./src/assets/varity-logo.svg",
        alt: "Varity Docs",
        replacesTitle: false,
      },
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/varity-labs",
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
        baseUrl: "https://github.com/varity-labs/varity-docs/edit/master/",
      },
      components: {
        ContentPanel: './src/components/overrides/ContentPanel.astro',
        PageSidebar: './src/components/overrides/PageSidebar.astro',
        PageTitle: './src/components/overrides/PageTitle.astro',
        Head: './src/components/overrides/Head.astro',
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
        // Open Graph image (shared with marketing site for brand consistency)
        {
          tag: "meta",
          attrs: {
            property: "og:image",
            content: "https://docs.varity.so/og-image.png",
          },
        },
        {
          tag: "meta",
          attrs: {
            property: "og:image:width",
            content: "1200",
          },
        },
        {
          tag: "meta",
          attrs: {
            property: "og:image:height",
            content: "630",
          },
        },
        {
          tag: "meta",
          attrs: {
            property: "og:image:alt",
            content: "Varity Docs: Predictable cloud hosting",
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
          tag: "meta",
          attrs: {
            name: "twitter:creator",
            content: "@VarityHQ",
          },
        },
        {
          tag: "meta",
          attrs: {
            name: "twitter:image",
            content: "https://docs.varity.so/og-image.png",
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
              label: "Install",
              slug: "getting-started/installation",
            },
            {
              label: "Deploy your first app",
              slug: "getting-started/quickstart",
            },
            {
              label: "Deploy from the Dashboard",
              slug: "deploy/deploy-from-dashboard",
            },
            {
              label: "What you can deploy",
              slug: "deploy/what-you-can-deploy",
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

        // ===== GUIDES =====
        {
          label: "Guides",
          items: [
            {
              label: "Deploy a Next.js App",
              slug: "guides/deploy-nextjs",
            },
            {
              label: "Deploy from Claude Code / Cursor / Windsurf",
              slug: "guides/deploy-from-ai-ide",
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
              label: "AI Tools Overview",
              slug: "ai-tools/overview",
            },
            {
              label: "MCP Server (Claude Code / Cursor)",
              slug: "ai-tools/mcp-server-spec",
            },
            { label: "API Reference", slug: "ai-tools/api-reference" },
            { label: "AI Prompts", slug: "ai-tools/prompts" },
            { label: "CLI (varitykit)", slug: "cli/overview" },
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
              label: "Deploy a Docker Image",
              slug: "deploy/deploy-docker-image",
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
              label: "Databases & Data",
              slug: "deploy/databases",
            },
            {
              label: "Environment Variables",
              slug: "deploy/env-variables",
            },
            {
              label: "App URLs and Names",
              slug: "deploy/custom-domains",
            },
            {
              label: "Recover a Previous Version",
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
              label: "Deployment Defaults",
              slug: "deploy/intelligent-orchestration",
            },
          ],
        },

        // ===== CLI REFERENCE =====
        {
          label: "CLI Reference",
          collapsed: true,
          items: [
            { label: "login / auth", slug: "cli/commands/auth" },
            { label: "doctor", slug: "cli/commands/doctor" },
            { label: "deploy", slug: "cli/commands/deploy" },
          ],
        },

        // ===== TUTORIALS =====
        {
          label: "Tutorials",
          collapsed: true,
          items: [
            { label: "Build with AI (No Code)", slug: "tutorials/build-with-ai" },
            { label: "Next.js Quick Start", slug: "getting-started/quickstart-nextjs" },
            { label: "Python Quick Start", slug: "getting-started/quickstart-python" },
          ],
        },

        // ===== PRICING & COSTS =====
        {
          label: "Pricing and Costs",
          items: [
            { label: "How pricing works", slug: "resources/pricing" },
            { label: "Billing", slug: "resources/billing" },
            { label: "FAQ", slug: "resources/faq" },
          ],
        },

        // ===== SECURITY =====
        {
          label: "Security",
          items: [
            { label: "Security & shared responsibility", slug: "resources/security" },
          ],
        },

        // ===== HELP =====
        {
          label: "Help",
          items: [
            { label: "Troubleshooting", slug: "resources/troubleshooting" },
            { label: "Glossary", slug: "resources/glossary" },
            { label: "Getting Help", slug: "getting-started/getting-help" },
          ],
        },
      ],
    }),
  ],
});
