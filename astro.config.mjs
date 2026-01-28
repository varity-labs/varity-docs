// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

// https://astro.build/config
export default defineConfig({
  site: "https://docs.varity.so",
  integrations: [
    starlight({
      title: "Varity Docs",
      description:
        "Build real-world apps on decentralized infrastructure. Deploy in 60 seconds with zero blockchain knowledge required.",
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
            content: "#030712",
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
            { label: "Quick Start", slug: "getting-started/quickstart" },
            { label: "Installation", slug: "getting-started/installation" },
          ],
        },

        // ===== BUILD YOUR APP =====
        {
          label: "Build Your App",
          items: [
            {
              label: "Authentication",
              items: [
                {
                  label: "Quick Start",
                  slug: "build/auth/quickstart",
                  badge: { text: "Start Here", variant: "success" },
                },
                { label: "Email Login", slug: "build/auth/email-login" },
                { label: "Social Login", slug: "build/auth/social-login" },
              ],
            },
            {
              label: "File Storage",
              items: [
                {
                  label: "Quick Start",
                  slug: "build/storage/quickstart",
                  badge: { text: "Start Here", variant: "success" },
                },
                { label: "Uploading Files", slug: "build/storage/upload" },
                { label: "Retrieving Files", slug: "build/storage/retrieve" },
              ],
            },
            {
              label: "Payments",
              items: [
                {
                  label: "Quick Start",
                  slug: "build/payments/quickstart",
                  badge: { text: "Start Here", variant: "success" },
                },
                { label: "Credit Card", slug: "build/payments/credit-card" },
                {
                  label: "Gasless Transactions",
                  slug: "build/payments/gasless",
                },
              ],
            },
            {
              label: "Compute & Hosting",
              badge: { text: "Coming Soon", variant: "caution" },
              items: [
                { label: "Overview", slug: "build/compute/overview" },
              ],
            },
          ],
        },

        // ===== DEPLOY =====
        {
          label: "Deploy",
          items: [
            {
              label: "Deploy to Varity L3",
              slug: "deploy/varity-l3",
              badge: { text: "Testnet", variant: "note" },
            },
            { label: "Environment Variables", slug: "deploy/env-variables" },
          ],
        },

        // ===== SDK PACKAGES =====
        {
          label: "SDK Packages",
          items: [
            {
              label: "@varity/sdk",
              items: [
                { label: "Overview", slug: "packages/sdk/overview" },
                { label: "Installation", slug: "packages/sdk/installation" },
                { label: "Chain Support", slug: "packages/sdk/chains" },
              ],
            },
            {
              label: "@varity/ui-kit",
              items: [
                { label: "Overview", slug: "packages/ui-kit/overview" },
                {
                  label: "Installation",
                  slug: "packages/ui-kit/installation",
                },
                { label: "Components", slug: "packages/ui-kit/components" },
                { label: "Hooks", slug: "packages/ui-kit/hooks" },
              ],
            },
            {
              label: "@varity/types",
              items: [
                { label: "Overview", slug: "packages/types/overview" },
              ],
            },
          ],
        },

        // ===== CLI REFERENCE =====
        {
          label: "CLI Reference",
          items: [
            { label: "Overview", slug: "cli/overview" },
            { label: "Installation", slug: "cli/installation" },
            {
              label: "Commands",
              items: [
                { label: "doctor", slug: "cli/commands/doctor" },
                { label: "init", slug: "cli/commands/init" },
                { label: "deploy", slug: "cli/commands/deploy" },
              ],
            },
          ],
        },

        // ===== RESOURCES =====
        {
          label: "Resources",
          items: [
            { label: "FAQ", slug: "resources/faq" },
            { label: "Troubleshooting", slug: "resources/troubleshooting" },
            { label: "Glossary", slug: "resources/glossary" },
          ],
        },
      ],
    }),
  ],
});
