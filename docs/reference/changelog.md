---
title: Changelog
description: Version history and release notes for AI Companion.
prev:
  text: Keyboard Shortcuts
  link: /reference/commands
---

# 📋 Changelog

## v1.0.0 — June 2026

Initial public release. 🎉

### ✦ Core AI Engine
- **Unified AI client** routing requests across all providers
- **Streaming responses** — tokens appear live using SSE for Gemini and OpenAI-compatible providers
- **Per-tier model routing** — assign different models to Fast / Balanced / Powerful / Creative action tiers
- **System prompt** configurable per user

### 🔑 Providers
- **Google Gemini** — full support including `gemini-2.5-flash`, `gemini-2.5-pro`, `gemini-2.5-flash-lite`, `gemini-1.5-flash`, `gemini-1.5-pro`
- **OpenAI** — full support including `gpt-4o`, `gpt-4o-mini`, `gpt-4-turbo`, `o1-mini`
- **Anthropic Claude** — full support including `claude-haiku-4-5`, `claude-sonnet-4-5`, `claude-opus-4-5`
- **OpenRouter** — access to 300+ models via a single API key; live model browser with no auth required for browsing

### 🔀 Model Browser
- Full-screen live model browser fetching OpenRouter's public model API
- Grouped by provider with emoji identifiers
- Search, filter by provider, filter by free-only, sort by price / context / name
- Price badge system: 🆓 FREE · 💚 budget · 🟡 mid · 🔴 premium
- Modality icons (text, image, audio, video, file)
- Refresh button to re-fetch the live model list
- Opens from Settings and from each tier card

### ✍️ Writing Actions (Inline Editor)
- **6 quick actions**: Improve, Grammar, Concise, Elaborate, Translate, Explain
- **5 tone pills**: 🎩 Formal, 😊 Casual, 🎓 Academic, 🤝 Friendly, ⚡ Blunt
- **Style of…**: Hemingway, Journalist, Tweet, Press Release, Academic Paper, Children's Story + custom input
- **Meeting Notes Formatter**: converts raw notes to structured markdown
- Keyboard navigation: Tab through quick actions, Enter to activate, ↑↓ for prompt history
- Prompt history (cycle previous prompts with arrow keys)

### 🎨 Diff Preview
- Side-by-side and inline red/green diff modes
- Word count delta display (−12 words / +8 words)
- Resizable diff modal with drag handle
- Accept / Reject / Edit before accepting

### 📚 Prompt Library
- Save, search, and reuse custom prompts
- Category organization
- CRUD interface inside the library modal
- Accessible from the popup and Command Palette

### ⚡ Quick Actions
- 6 built-in quick action buttons
- User-configurable custom quick actions (icon + label + prompt)
- Keyboard navigation support

### 🤖 Automation
- **Paste Refactor**: toast suggestion when pasting >200 characters
- **AI Paste** command: <kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>V</kbd>
- **Auto-title**: AI suggests 3 title options for new Untitled notes
- **/ai slash commands**: `/ai ask`, `/ai improve`, `/ai summary`, `/ai tags`, `/ai outline`, `/ai translate`, `/ai meeting`

### 💾 History & Persistence
- Persistent history panel saved to `_ai-companion/history.json` in your vault
- Live pending request display with animated token counter
- Configurable max entries (default 200)
- Clear history button

### ⚙️ Settings
- Full settings tab with provider cards (with connection status indicator)
- Per-provider API key + Test button
- Model tier grid with Browse & Select per tier
- Temperature slider, max tokens, system prompt textarea
- Diff mode toggle, automation toggles, history configuration
