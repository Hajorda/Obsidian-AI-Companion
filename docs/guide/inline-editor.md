---
title: Inline AI Editor
description: The core feature of AI Companion — a floating popup that lets you edit, improve, and transform any selected text with AI.
prev:
  text: Model Tiers
  link: /guide/model-tiers
next:
  text: Tone Adjustment
  link: /guide/tone
---

# Inline AI Editor

The Inline AI Editor is the heart of AI Companion. It's a floating panel that appears directly in your note when you select text, giving you instant access to AI-powered edits, rewrites, and questions — without ever leaving your writing flow.

---

## Opening the Editor

1. **Select any text** in a note (a word, sentence, paragraph, or multiple paragraphs)
2. Press the keyboard shortcut:
   - **Mac:** <kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>A</kbd>
   - **Windows / Linux:** <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>A</kbd>

The editor panel appears near your selection, anchored to the cursor position.

::: tip You can also open from the Command Palette
Press <kbd>Cmd</kbd>+<kbd>P</kbd> / <kbd>Ctrl</kbd>+<kbd>P</kbd> and search for **"Edit with AI"**. This is useful if you've changed or forgotten the hotkey.
:::

::: info No text selected?
If you open the editor without selecting text, it defaults to operating on the **entire current paragraph** the cursor is in. This is useful for quick inline edits without careful selection.
:::

---

## Panel Layout

The panel is divided into sections from top to bottom:

```
┌─────────────────────────────────────────────┐
│  [Improve] [Grammar] [Concise] [Elaborate]  │  ← Quick actions row
│  [Translate] [Explain]                       │
├─────────────────────────────────────────────┤
│  Tone: [Formal] [Casual] [Academic]         │  ← Tone row
│        [Friendly] [Blunt]                   │
├─────────────────────────────────────────────┤
│  Style: [Hemingway] [Journalist] [Tweet]    │  ← Style row
│         [Press Release] [Academic Paper]    │
│         [Children's Story] [_custom_____]   │
├─────────────────────────────────────────────┤
│  ┌──────────────────────────────────────┐   │
│  │ Type a custom prompt...        [↑↓] │   │  ← Prompt input + history nav
│  └──────────────────────────────────────┘   │
│  [📚 Library]                [gemini-flash]  │  ← Library button + model chip
│                              [Send ▶]        │
└─────────────────────────────────────────────┘
```

---

## Quick Action Buttons

Quick actions are single-click operations that immediately send your selection to the AI with a pre-built prompt. The response streams in live.

| Button | What It Does |
|---|---|
| **Improve** | Rewrites the text for clarity, flow, and overall quality. Preserves your meaning and voice. |
| **Grammar** | Fixes grammar, spelling, and punctuation errors only. Does not rephrase or restructure. |
| **Concise** | Shortens the text by removing redundancy and filler while keeping the core meaning. |
| **Elaborate** | Expands the text with additional detail, context, examples, or explanation. |
| **Translate** | Opens a language picker, then translates the selected text into your chosen language. |
| **Explain** | Replies with an explanation of the selected text in plain, accessible language — shown as a reply bubble, not a diff. |

::: tip Keyboard Navigation on Quick Actions
Press <kbd>Tab</kbd> to cycle through the quick action buttons, then <kbd>Enter</kbd> or <kbd>Space</kbd> to activate the focused button. This lets you trigger actions without using the mouse.
:::

---

## Tone Row

The Tone row lets you rewrite your selected text in a specific emotional register. See [Tone Adjustment](/guide/tone) for the full guide.

| Tone | Description |
|---|---|
| **Formal** | Professional language, no contractions, authoritative |
| **Casual** | Friendly and relaxed, like writing to a friend |
| **Academic** | Scholarly vocabulary, hedged claims, structured argument |
| **Friendly** | Warm, encouraging, and empathetic |
| **Blunt** | Direct and unhedged — gets straight to the point |

Clicking a tone button immediately triggers a rewrite and opens the Diff Preview.

---

## Style Panel

The Style panel goes beyond tone — it rewrites your text in a completely different **format and voice**. This is for when you need to transform content into a specific genre or medium.

| Style | What It Produces |
|---|---|
| **Hemingway** | Short sentences, active voice, no adverbs — spare and punchy prose |
| **Journalist** | Inverted pyramid, newsy lead sentence, attributed quotes style |
| **Tweet** | Concise, punchy, max ~280 chars, hashtag-ready |
| **Press Release** | Formal PR structure with dateline, quotes, boilerplate |
| **Academic Paper** | Abstract-style introduction, formal register, citation-aware language |
| **Children's Story** | Simple vocabulary, short sentences, narrative and engaging |
| **Custom** | Type any style in the text box — e.g., *"Write this as a Slack message"* or *"Rewrite as a haiku"* |

::: info Custom Style Examples
The custom style input accepts any description. Some ideas:

- `"Write as a Y Combinator pitch"` 
- `"Rewrite as a formal legal letter"`
- `"Make this sound like Paul Graham"`
- `"Format as a Discord announcement"`
:::

---

## Custom Prompt Input

The text input at the bottom of the panel accepts any natural language instruction. This is where you ask the AI to do something the quick actions don't cover.

**Examples:**

```
Make this a Jira ticket
Rewrite in first-person perspective
Add transition sentences between paragraphs
Turn these bullet points into a numbered list
Extract the action items from this
Translate to French and make it more formal
```

Press <kbd>Enter</kbd> to send the prompt, or click **Send**.

### Prompt History Navigation

Press <kbd>↑</kbd> (Up arrow) and <kbd>↓</kbd> (Down arrow) in the prompt input to cycle through your **recent prompt history**. The last 50 prompts are remembered per session.

This makes it easy to re-run or refine a previous prompt without retyping.

---

## Prompt Library Button

Click the **📚 Library** button (bottom-left of the panel) to open your Prompt Library. From there you can:

- Browse saved prompts by category
- Click **Use** to instantly populate the input field with a saved prompt
- Save the current prompt for future use

See [Prompt Library](/guide/prompt-library) for the full guide.

---

## Current Model Chip

The **model chip** in the bottom-right shows which AI model will be used for the current action — e.g., `gemini-2.5-flash`. 

- If Model Tiers are enabled, the chip updates dynamically based on which action you're about to take
- Click the chip to jump directly to provider settings and change the model

---

## Streaming Responses

All AI responses **stream in live** — text appears word by word as it's generated, just like in ChatGPT. You don't have to wait for the full response before seeing progress.

For **edit actions** (Improve, Grammar, Concise, Elaborate, Tone, Style), the diff preview opens as soon as the full response completes.

For **question actions** (Explain, custom prompts that ask rather than edit), the response appears in a **reply bubble** below the panel — it streams in live and can be copied with one click.

---

## Understanding the Result

After an edit action completes, the **Diff Preview** opens automatically. See [Diff Preview](/guide/diff-preview) for the full guide.

In brief:
- 🟢 **Green** = text added by the AI
- 🔴 **Red** = text removed by the AI
- ✅ **Accept** = replace original with AI version
- ❌ **Reject** = keep original, discard AI version
- ✏️ **Edit** = manually tweak the AI result before accepting

---

## Closing the Editor

- Press <kbd>Esc</kbd> to close the panel without making any changes
- Click anywhere outside the panel to dismiss it
- Accepting or rejecting a diff also closes the panel

::: warning Streaming in progress
If you press <kbd>Esc</kbd> while the AI is streaming a response, the request will be **cancelled** immediately and no changes will be made.
:::
