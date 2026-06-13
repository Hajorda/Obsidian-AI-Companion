---
title: History Panel
description: Every AI request is logged and searchable. History survives Obsidian restarts.
prev:
  text: Auto-Title Notes
  link: /guide/auto-title
next:
  text: All Settings
  link: /reference/settings
---

# 🕐 History Panel

AI Companion keeps a full log of every request you've made — what you asked, which model answered, and what it said. History is saved to your vault so it survives restarts.

## Opening the history panel

Three ways:

1. **Ribbon icon** — click the ✦ sparkles icon in the left sidebar
2. **Command palette** — <kbd>Cmd</kbd>+<kbd>P</kbd> → **"Toggle AI History Panel"**
3. **Keyboard shortcut** — assign one in Obsidian Settings → Hotkeys → "AI Companion: Toggle History"

The panel opens as a sidebar leaf (right side by default).

## What each entry shows

| Field | Description |
|---|---|
| **Timestamp** | When the request was made (relative: "2 min ago") |
| **Provider** | Which AI provider handled it (🔵 Gemini, 🟢 OpenAI, etc.) |
| **Model** | Exact model used (e.g. `gemini-2.5-flash`) |
| **Action** | What you did (Improve, Grammar, Custom, etc.) |
| **Prompt** | Your instruction or custom question |
| **Response snippet** | First 120 characters of the AI's reply |

Click any entry to expand it and see the **full response**.

## Live pending requests

While a request is in flight, a live entry appears at the top of the panel with:

- ⏳ Elapsed time counter
- 🔄 Animated token counter (tokens received so far during streaming)
- Blinking cursor

This updates in real time — you can watch the response build up even before the diff modal opens.

## Persistent history

History is automatically saved to a JSON file in your vault:

```
_ai-companion/history.json
```

This file is created automatically. You can:
- Open it in any text editor to inspect raw data
- Back it up with your vault
- Delete it to clear all history permanently

**Configure the path** — Settings → History → History file path

::: warning Don't edit history.json while Obsidian is open
If you manually edit the file while the plugin is active, your changes may be overwritten. Close the vault first, or use the Clear History button in the panel.
:::

## Clearing history

- **Clear all** — click the trash icon in the history panel header. This clears in-memory history AND deletes `history.json`.
- **Max entries** — set a cap in Settings → History → Max history entries (default: 200). Oldest entries are removed automatically when the limit is reached.

::: tip Search your history
Use <kbd>Cmd</kbd>+<kbd>F</kbd> in the history panel to find past requests by keyword.
:::
