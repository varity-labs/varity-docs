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
        "Deploy apps to decentralized infrastructure with one command. 70-85% cheaper than AWS.",
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
      customCss: ["./src/styles/varity-theme.css"],
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
                { label: "Chain Support", slug: "packages/sdk/chains" },
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

            // ----- FILE STORAGE -----
            {
              label: "File Storage",
              collapsed: false,
              items: [
                {
                  label: "Quick Start (thirdweb)",
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
                  label: "Quick Start (thirdweb Pay)",
                  slug: "build/payments/quickstart",
                  badge: { text: "Recommended", variant: "success" },
                },
                { label: "Credit Card On-ramp", slug: "build/payments/credit-card" },
                { label: "Gasless Transactions", slug: "build/payments/gasless" },
              ],
            },

            // ----- SMART WALLETS -----
            {
              label: "Smart Wallets",
              collapsed: false,
              items: [
                {
                  label: "Quick Start",
                  slug: "build/wallets/quickstart",
                  badge: { text: "Recommended", variant: "success" },
                },
                { label: "Create Wallet", slug: "build/wallets/create-wallet" },
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
              label: "Varity L3",
              slug: "deploy/varity-l3",
              badge: { text: "Testnet", variant: "note" },
            },
            { label: "Environment Variables", slug: "deploy/env-variables" },
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
