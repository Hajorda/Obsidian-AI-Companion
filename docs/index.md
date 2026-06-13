---
# docs/index.md — Landing page
layout: home

hero:
  name: "AI Companion"
  text: "for Obsidian"
  tagline: "Your personal AI writing assistant — inline edits, smart rewrites, meeting notes, and 300+ models. All inside Obsidian."
  image:
    src: /hero-icon.svg
    alt: AI Companion
  actions:
    - theme: brand
      text: 🚀 Get Started
      link: /guide/installation
    - theme: alt
      text: 📖 Read the Guide
      link: /guide/quick-start
    - theme: alt
      text: ⭐ GitHub
      link: https://github.com/Hajorda/Obsidian-AI-Companion

features:
  - icon: ✦
    title: Inline AI Editor
    details: Select any text and press Cmd+Shift+A. Ask the AI to edit it, improve it, fix grammar, or answer a question — without leaving the note.
    link: /guide/inline-editor
    linkText: Learn more

  - icon: ⚡
    title: Streaming Responses
    details: Tokens appear in real time as they arrive. No waiting for the full response. Includes a live cursor and animated history panel.
    link: /guide/inline-editor
    linkText: Learn more

  - icon: 🔀
    title: 300+ Models via OpenRouter
    details: One API key unlocks every major model — GPT-5.5, Claude Opus, Gemini, Llama, DeepSeek, and dozens of free models.
    link: /guide/model-browser
    linkText: Browse models

  - icon: ⚖️
    title: Model Tiers
    details: Assign different models to different task types. Use a fast cheap model for grammar checks and a powerful one for full-note summaries.
    link: /guide/model-tiers
    linkText: Configure tiers

  - icon: 🎨
    title: Diff Preview
    details: Every AI edit shows a side-by-side or inline diff before you accept. Word count delta, drag-to-resize, accept or reject with one click.
    link: /guide/diff-preview
    linkText: Learn more

  - icon: 🎭
    title: Tone Adjustment
    details: Instantly rewrite selected text as Formal, Casual, Academic, Friendly, or Blunt — with a single button click in the AI popup.
    link: /guide/tone
    linkText: Learn more

  - icon: ✍️
    title: Style Rewrites
    details: Rewrite in the style of Hemingway, a Tweet, a Press Release, an Academic Paper, or any custom style you describe.
    link: /guide/inline-editor
    linkText: Learn more

  - icon: 📋
    title: Meeting Notes Formatter
    details: Paste raw meeting notes and one command structures them into Agenda, Decisions, and Action Items in clean markdown.
    link: /guide/meeting-notes
    linkText: Learn more

  - icon: 📚
    title: Prompt Library
    details: Save your best prompts and reuse them with one click. Searchable, organized by category, accessible from every AI popup.
    link: /guide/prompt-library
    linkText: Learn more

  - icon: 💾
    title: Persistent History
    details: Every AI request is saved to a JSON file in your vault. History survives Obsidian restarts and is viewable in the sidebar panel.
    link: /guide/history
    linkText: Learn more

  - icon: 🤖
    title: Smart Automation
    details: Auto-refactor on paste, auto-title new notes, and /ai slash commands for instant access to any feature without leaving the keyboard.
    link: /guide/automation
    linkText: Learn more

  - icon: 🔑
    title: Multi-Provider
    details: Supports Google Gemini, OpenAI, Anthropic Claude, and OpenRouter — all configurable with per-provider API keys and model selection.
    link: /guide/providers
    linkText: Setup guide
---

<div style="text-align:center; padding: 48px 24px 0; max-width: 680px; margin: 0 auto;">
  <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 10px;">Works with every major AI provider</h2>
  <p style="color: var(--vp-c-text-2); margin-bottom: 24px;">Add one API key or all of them — each provider works independently.</p>
  <div style="display:flex; gap:12px; justify-content:center; flex-wrap:wrap;">
    <span class="provider-pill">🔵 Google Gemini</span>
    <span class="provider-pill">🟢 OpenAI</span>
    <span class="provider-pill">🟣 Anthropic Claude</span>
    <span class="provider-pill">🔀 OpenRouter</span>
  </div>
</div>

<div style="text-align:center; padding: 48px 24px; max-width: 560px; margin: 0 auto;">
  <blockquote style="font-size: 18px; font-style: italic; color: var(--vp-c-text-1); line-height: 1.7; border: none; padding: 0;">
    "The AI popup opens in under 100ms, streams responses live, and shows a diff before touching your note. It's the Obsidian AI plugin I always wanted."
  </blockquote>
</div>
