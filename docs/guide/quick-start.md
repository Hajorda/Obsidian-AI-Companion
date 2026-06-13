---
title: Quick Start (2 min)
description: Get your first AI edit in under 2 minutes — add your key, select text, and start transforming your writing.
prev:
  text: Installation
  link: /guide/installation
next:
  text: Provider Setup
  link: /guide/providers
---

# Quick Start <Badge type="tip" text="2 min" />

This guide gets you from zero to your first AI-assisted edit in under two minutes. Let's go.

---

## Step 1 — Add Your Gemini API Key

::: tip No key yet?
Get a free Gemini API key at [aistudio.google.com](https://aistudio.google.com) — no credit card required. It takes about 30 seconds.
:::

1. Open **Settings** → **AI Companion**
2. Find the **Google Gemini** section under *Providers*
3. Paste your API key into the **API Key** field
4. Click the **Test** button — you should see ✅ *Connection successful*
5. Make sure **Google Gemini** is selected as your **Default Provider**

Your key is stored locally in your vault and never sent anywhere except directly to the provider's API.

---

## Step 2 — Select Some Text

Open any note in your vault and **highlight a sentence or paragraph** you want to improve.

```
Before: "The meeting was long and we talked about a bunch of stuff and eventually decided to do the project."
```

Select this text by clicking and dragging, or use <kbd>Shift</kbd>+<kbd>↓</kbd> / <kbd>Shift</kbd>+<kbd>End</kbd> to extend the selection with the keyboard.

::: info Any text works
You can select a single sentence, a whole paragraph, bullet points, or even just a word. The AI works with whatever you give it.
:::

---

## Step 3 — Open the Inline AI Editor

With text selected, press:

- **Mac:** <kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>A</kbd>
- **Windows / Linux:** <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>A</kbd>

A popup panel will appear near your selection. You'll see:

- A row of **quick action buttons** (Improve, Grammar, Concise, Elaborate…)
- A **text input** for custom prompts
- A **model chip** showing which AI model is active

---

## Step 4 — Pick an Action

Click one of the quick action buttons to instantly send your text to the AI:

| Button | What it does |
|---|---|
| **Improve** | Rewrites for clarity, flow, and impact |
| **Grammar** | Fixes grammar and spelling only |
| **Concise** | Shortens without losing meaning |
| **Elaborate** | Expands with more detail and context |
| **Translate** | Converts to another language |
| **Explain** | Explains the selected text in plain language |

Or type your own instruction in the prompt box and press <kbd>Enter</kbd> or click **Send**.

The response streams in live — you'll see the text appear word by word.

---

## Step 5 — Accept or Reject the Result

Once the AI finishes, a **Diff Preview** appears showing what changed:

- **Green highlights** = text the AI added
- **Red highlights** = text the AI removed

You have three choices:

| Button | Action |
|---|---|
| ✅ **Accept** | Replaces your original selection with the AI text |
| ❌ **Reject** | Closes the diff, your original text is untouched |
| ✏️ **Edit** | Opens the AI result in a text editor before accepting |

Click **Accept** and you're done — your note is updated instantly.

---

## What's Next?

You've completed your first AI edit! Here are some things to explore:

- **Tone buttons** — Rewrite in Formal, Casual, Academic, Friendly, or Blunt style
- **Style panel** — Rewrite as a Tweet, Press Release, or Children's Story
- **Custom prompts** — Type anything: *"Make this a Jira ticket"* or *"Summarize for a 5-year-old"*
- **Prompt Library** — Save your favorite prompts for reuse

::: tip Try the /ai slash command
You can also trigger AI actions without selecting text first. In any note, type `/ai` followed by a command:

```
/ai improve
/ai summary
/ai ask What are the key takeaways here?
```

Enable slash commands in **Settings** → **Automation** → **Slash commands**. See [Slash Commands](/guide/slash-commands) for the full list.
:::
