---
title: Auto-Title Notes
description: AI suggests titles for new Untitled notes as soon as you start writing.
prev:
  text: Slash Commands
  link: /guide/slash-commands
next:
  text: History Panel
  link: /guide/history
---

# 🏷️ Auto-Title Notes

Never stare at "Untitled" again. When you create a new note and start writing, AI Companion watches in the background and offers 3 title suggestions the moment you have enough content.

## How it works

1. **Create a new note** — Obsidian names it "Untitled" by default
2. **Start writing** — as soon as your note reaches **150 characters**, a 2-second countdown begins
3. **Toast appears** — a small notification shows at the bottom of your screen:
   > ✦ **AI can suggest a title for this note** — Suggest · Dismiss
4. **Click Suggest** — a compact modal opens with 3 AI-generated title options
5. **Click a title** — the note is immediately renamed. Done.

Or type your own title in the text field at the bottom of the modal and press <kbd>Enter</kbd>.

## Triggering conditions

The toast only appears when **all** of these are true:

| Condition | Value |
|---|---|
| File name | Starts with "Untitled" (case-insensitive) |
| Content length | ≥ 150 characters |
| Debounce | 2 seconds after you stop typing |
| Feature | Enabled in Settings |

::: info Why 150 characters?
That's roughly 1–2 sentences — enough for the AI to understand the topic without you having to write a full paragraph first.
:::

## Enabling / disabling

**Settings → AI Companion → Automation → Auto-title new notes** — toggle on or off.

When disabled, the toast never appears. You can still trigger the command manually:

<kbd>Cmd</kbd>+<kbd>P</kbd> → **"AI: Suggest title for this note"**

## Tips for better titles

::: tip Start with a clear topic sentence
The AI reads the first ~500 characters. If your opening line is vague ("So I was thinking about..."), the title suggestions will be vague too. Start with what the note is actually about.
:::

::: tip Use it on existing untitled notes
Rename any file to "Untitled" temporarily, open it, and trigger the command from the palette — the AI will suggest a title based on the content.
:::

::: tip Dismiss if you already have a name in mind
Hit Dismiss (or press <kbd>Escape</kbd>) to close the toast. It won't reappear for the same note unless you reload Obsidian.
:::
