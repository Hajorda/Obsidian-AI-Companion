---
title: Prompt Library
description: Save your best prompts and reuse them with one click from any AI popup.
prev:
  text: Meeting Notes Formatter
  link: /guide/meeting-notes
next:
  text: Automation & Paste Refactor
  link: /guide/automation
---

# 📚 Prompt Library

The Prompt Library lets you save any custom prompt and reuse it instantly from anywhere in the plugin — the inline editor popup, the command palette, or the dedicated library modal.

## Opening the library

Three ways to access it:

1. **From the AI popup** — click the **📚 Library** button in the bottom bar of the inline editor
2. **Command palette** — <kbd>Cmd</kbd>+<kbd>P</kbd> → search **"Open Prompt Library"**
3. **Ribbon icon** — if you've pinned it to the sidebar

## Saving a prompt

**From the popup:** After typing a custom prompt, click the **Save** icon (💾) next to the input field. Give it a name and optionally a category.

**From the library modal:** Click **+ New Prompt**, fill in the form:

| Field | Description |
|---|---|
| **Name** | Short label shown in the list (e.g. "Jira ticket") |
| **Prompt** | The full instruction sent to the AI |
| **Category** | Optional grouping (e.g. "Work", "Writing", "Code") |

## Using a saved prompt

1. Open the library (any method above)
2. Find your prompt by name or search
3. Click **Use** — the prompt is loaded into the active AI popup input
4. Your selected text is automatically included as context
5. Hit Send

## Managing prompts

- **Edit** — click the pencil icon on any prompt card
- **Delete** — click the trash icon (confirms before deleting)
- **Search** — type in the search bar to filter by name or content
- **Filter by category** — click a category chip to show only that group

## Prompt ideas to get you started

| Name | Prompt | Category |
|---|---|---|
| Jira ticket | Convert this into a Jira ticket with title, description, and acceptance criteria | Work |
| LinkedIn post | Write a LinkedIn post about this topic. Professional but conversational, under 200 words | Writing |
| Explain like I'm 5 | Explain this to a 5-year-old. Use simple words and a fun analogy | Writing |
| Code review | Review this code for bugs, performance issues, and style. Give specific feedback | Code |
| TL;DR | Summarize this in 2-3 bullet points maximum | Writing |
| Email reply | Write a polite professional reply to this email | Work |
| Tweet thread | Turn this into a Twitter/X thread of 5 tweets | Writing |
| Devil's advocate | List the strongest counterarguments against this position | Thinking |

::: tip Use `{{text}}` for context
Your selected text is always appended automatically. Your prompt just needs to be the instruction — the AI sees both.
:::

::: tip Categories keep things tidy
If you save more than ~10 prompts, adding categories (Work / Writing / Code / Research) makes filtering much faster.
:::
