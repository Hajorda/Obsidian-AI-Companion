---
title: Automation & Paste Refactor
description: Let AI work automatically in the background — on paste, on note creation, and more.
prev:
  text: Prompt Library
  link: /guide/prompt-library
next:
  text: Slash Commands
  link: /guide/slash-commands
---

# 🤖 Automation & Paste Refactor

AI Companion can act automatically in the background without you needing to open any popup. Two main automations: **Paste Refactor** and **Auto-Title**.

## Paste Refactor

When you paste a large block of text into Obsidian, a subtle toast notification appears at the bottom of the screen:

> ✦ **AI can clean up this paste** — Refactor · Dismiss

Clicking **Refactor** sends the pasted text through the AI (using your configured provider) and shows the result as a diff. You can accept, reject, or ignore it — your original paste is always preserved until you explicitly accept.

### When it triggers

The toast only appears when the pasted content is **longer than the minimum character threshold** (default: 200 characters). This prevents it from firing on small copy-pastes.

### Configure it

Go to **Settings → AI Companion → Automation**:

| Setting | Default | Description |
|---|---|---|
| Auto-suggest on paste | ✅ On | Toggle the feature on/off |
| Minimum characters | 200 | Only trigger above this paste length |

::: tip Use it for pasted web content
Paste an article, a Slack thread, or raw API output — the AI cleans up formatting, removes filler, and makes it note-ready in one click.
:::

### Manual trigger: AI Paste

You can also trigger paste refactor manually at any time with the keyboard shortcut:

<kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>V</kbd> — **AI Paste**

This grabs whatever is in your clipboard, sends it to the AI for cleanup, and inserts the result at your cursor as a diff.

## Auto-Title New Notes

When you create a new note (or open an "Untitled" note) and write **150 or more characters**, a toast notification appears after a 2-second pause:

> ✦ **AI can suggest a title** — Suggest · Dismiss

Clicking **Suggest** sends the beginning of your note to the AI, which generates 3 title options. A small modal shows all 3 — click one to immediately rename the note. Or type your own title in the input field at the bottom.

### When it triggers

- File name starts with "Untitled" (any variation)
- Note content is ≥ 150 characters
- 2-second debounce after you stop typing (so it doesn't fire mid-sentence)

### Configure it

Go to **Settings → AI Companion → Automation → Auto-title new notes** and toggle on/off.

::: info How titles are generated
The AI reads the first ~500 characters of your note and generates 3 concise, descriptive titles. The best title is usually the one that sounds like a document heading — not a sentence.
:::

::: tip Write a clear opening line
The AI generates better titles when your note starts with a clear topic sentence or summary. A strong first paragraph = better title suggestions.
:::
