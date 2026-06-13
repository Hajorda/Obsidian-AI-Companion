---
title: Meeting Notes Formatter
description: Paste raw meeting notes and get a structured markdown document in seconds.
prev:
  text: Diff Preview
  link: /guide/diff-preview
next:
  text: Prompt Library
  link: /guide/prompt-library
---

# 📋 Meeting Notes Formatter

Turn messy raw meeting notes into a clean, structured markdown document with a single command.

## How to use

**Option A — Selected text:**
1. Select your raw notes in the editor
2. Press <kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>A</kbd> to open the AI popup
3. Type `meeting notes` or pick it from the prompt history
4. The AI formats the selection and shows a diff for review

**Option B — Whole note via command:**
1. Open the Command Palette with <kbd>Cmd</kbd>+<kbd>P</kbd>
2. Search for **"Format as meeting notes"**
3. The entire active note is sent to the AI and the result appears as a diff

## Output format

The AI produces structured markdown using these sections (any section with no content is automatically omitted):

```markdown
## Meeting Summary
**Date**: June 13, 2026
**Attendees**: Alice, Bob, Carol

### Agenda
- Q3 roadmap review
- Infrastructure migration plan
- Hiring discussion

### Key Decisions
- Ship v2.0 by end of July
- Move to new cloud provider in August

### Action Items
- [ ] Alice — finalize roadmap doc by Friday
- [ ] Bob — send migration cost estimate
- [ ] Carol — post job listing for senior engineer

### Notes
Discussed possibility of a team offsite in September. No decision made yet.
```

## Tips for best results

::: tip Use clear bullet points
The AI works best when your raw notes have at least a few distinct items. Even rough bullets like `- alice: do the thing` are enough context.
:::

::: tip Attendee names
If you mention names in your raw notes ("Alice said...", "Bob will..."), the AI will pick them up automatically for the Attendees list and attribute Action Items correctly.
:::

::: info Sections are inferred
You don't need to label your raw notes. The AI reads the content and decides what's an agenda topic vs. a decision vs. an action item based on context.
:::

::: warning Very short notes
If your raw notes are fewer than 3–4 bullet points, the AI may produce a minimal output. For the best structured result, paste at least a paragraph of notes.
:::

## Example input → output

**Raw input:**
```
- sync with alice and bob about roadmap
- bob says infra migration will cost ~$5k/month
- we decided to go with vercel
- alice to write up the doc
- maybe offsite in sept?
```

**AI output:**
```markdown
## Meeting Summary
**Attendees**: Alice, Bob

### Key Decisions
- Use Vercel for infrastructure

### Action Items
- [ ] Alice — write up the roadmap doc

### Notes
- Infrastructure migration estimated at ~$5k/month
- Team offsite in September discussed, no decision made
```
