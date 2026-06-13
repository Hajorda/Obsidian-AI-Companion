// docs/.vitepress/config.ts
import { defineConfig } from "vitepress";

export default defineConfig({
  // ── Site metadata ──────────────────────────────────────────────────────────
  lang: "en-US",
  title: "AI Companion for Obsidian",
  description:
    "A powerful AI writing assistant built into Obsidian. Supports Gemini, OpenAI, Claude, and 300+ models via OpenRouter.",

  // ── GitHub Pages base (update to /your-repo-name/ when you push) ──────────
  base: "/Obsidian-AI-Companion/",

  // ── Head tags ─────────────────────────────────────────────────────────────
  head: [
    ["link", { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" }],
    ["meta", { name: "theme-color", content: "#7c3aed" }],
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:title", content: "AI Companion for Obsidian" }],
    ["meta", {
      property: "og:description",
      content: "A powerful AI writing assistant built into Obsidian. Gemini, OpenAI, Claude, OpenRouter — all in one plugin.",
    }],
  ],

  // ── Theme ─────────────────────────────────────────────────────────────────
  themeConfig: {
    logo: "/logo.svg",
    siteTitle: "AI Companion",

    // ── Top nav ─────────────────────────────────────────────────────────────
    nav: [
      { text: "🚀 Get Started", link: "/guide/installation" },
      { text: "📖 Guide", link: "/guide/quick-start" },
      { text: "⚙️ Reference", link: "/reference/settings" },
      { text: "📋 Changelog", link: "/reference/changelog" },
      {
        text: "⭐ GitHub",
        link: "https://github.com/Hajorda/Obsidian-AI-Companion",
      },
    ],

    // ── Sidebar ──────────────────────────────────────────────────────────────
    sidebar: [
      {
        text: "🚀 Getting Started",
        collapsed: false,
        items: [
          { text: "Installation", link: "/guide/installation" },
          { text: "Quick Start (2 min)", link: "/guide/quick-start" },
        ],
      },
      {
        text: "🔑 Providers & Models",
        collapsed: false,
        items: [
          { text: "Provider Setup", link: "/guide/providers" },
          { text: "Model Browser", link: "/guide/model-browser" },
          { text: "Model Tiers", link: "/guide/model-tiers" },
        ],
      },
      {
        text: "✍️ Writing Features",
        collapsed: false,
        items: [
          { text: "Inline AI Editor", link: "/guide/inline-editor" },
          { text: "Tone Adjustment", link: "/guide/tone" },
          { text: "Diff Preview", link: "/guide/diff-preview" },
          { text: "Meeting Notes", link: "/guide/meeting-notes" },
          { text: "Prompt Library", link: "/guide/prompt-library" },
        ],
      },
      {
        text: "⚡ Automation",
        collapsed: false,
        items: [
          { text: "Paste Refactor", link: "/guide/automation" },
          { text: "Slash Commands (/ai)", link: "/guide/slash-commands" },
          { text: "Auto-Title Notes", link: "/guide/auto-title" },
        ],
      },
      {
        text: "🕐 History",
        collapsed: false,
        items: [
          { text: "History Panel", link: "/guide/history" },
        ],
      },
      {
        text: "📋 Reference",
        collapsed: false,
        items: [
          { text: "All Settings", link: "/reference/settings" },
          { text: "Keyboard Shortcuts", link: "/reference/commands" },
          { text: "Changelog", link: "/reference/changelog" },
        ],
      },
    ],

    // ── Footer ───────────────────────────────────────────────────────────────
    footer: {
      message: "Released under the MIT License.",
      copyright: "Built for the Obsidian community ✦",
    },

    // ── Social links ─────────────────────────────────────────────────────────
    socialLinks: [
      { icon: "github", link: "https://github.com/Hajorda/Obsidian-AI-Companion" },
    ],

    // ── Built-in search ──────────────────────────────────────────────────────
    search: {
      provider: "local",
    },

    // ── Edit link ────────────────────────────────────────────────────────────
    editLink: {
      pattern:
        "https://github.com/Hajorda/Obsidian-AI-Companion/edit/main/docs/:path",
      text: "Edit this page on GitHub",
    },

    // ── Last updated ─────────────────────────────────────────────────────────
    lastUpdated: {
      text: "Updated at",
      formatOptions: { dateStyle: "medium" },
    },
  },

  // ── Markdown ─────────────────────────────────────────────────────────────
  markdown: {
    theme: {
      light: "github-light",
      dark: "one-dark-pro",
    },
    lineNumbers: true,
  },
});
