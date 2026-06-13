---
title: Slash Commands (/ai)
description: Trigger AI actions inline with /ai commands without opening any popup.
prev:
  text: Automation & Paste Refactor
  link: /guide/automation
next:
  text: Auto-Title Notes
  link: /guide/auto-title
---

# ⚡ Slash Commands (`/ai`)

Slash commands let you trigger AI actions by typing directly in a note — no popup, no mouse. Just type a command, press <kbd>Enter</kbd>, and the AI works on the text around your cursor.

## Enabling slash commands

Go to **Settings → AI Companion → Automation → /ai slash commands** and toggle it on.

::: info Default state
Slash commands are **enabled by default**. Disable them if you use another plugin that conflicts with the `/ai` prefix.
:::

## Available commands

| Command | What it does |
|---|---|
| `/ai help` | Shows a brief list of available commands in a notice |
| `/ai ask [question]` | Asks the AI a question, answer appears as a reply bubble below |
| `/ai improve` | Improves the paragraph at your cursor |
| `/ai grammar` | Fixes grammar in the paragraph at your cursor |
| `/ai concise` | Makes the paragraph at your cursor more concise |
| `/ai elaborate` | Expands the paragraph at your cursor with more detail |
| `/ai summary` | Summarizes the entire note |
| `/ai tags` | Generates tags for the entire note |
| `/ai outline` | Creates a structured outline for the entire note |
| `/ai title` | Suggests a title for the note |
| `/ai translate [language]` | Translates the paragraph at your cursor to the given language |
| `/ai meeting` | Formats the entire note as meeting notes |

## How it works

1. Position your cursor anywhere in a paragraph
2. Type the slash command on a new line (e.g. `/ai improve`)
3. Press <kbd>Enter</kbd>
4. The command line is removed and the AI processes the relevant text
5. Result appears as a diff (for edits) or a reply bubble (for questions/answers)

**Example:**

```
This feature is really good and helps users a lot with stuff they need.

/ai concise
```

After pressing Enter, the `/ai concise` line disappears and a diff appears showing a tightened version of the paragraph above.

## `/ai ask` with streaming

The `ask` command supports streaming — the answer appears word by word in a reply bubble below your cursor position:

```
What is the difference between TCP and UDP?

/ai ask
```

Or inline:
```
/ai ask What is the difference between TCP and UDP?
```

::: tip Fastest way to ask a quick question
`/ai ask` is faster than opening the popup when you just need a quick factual answer while writing.
:::

::: tip Language codes for translate
Use natural language: `/ai translate Spanish`, `/ai translate Japanese`, `/ai translate French`. The AI understands both full names and codes.
:::
