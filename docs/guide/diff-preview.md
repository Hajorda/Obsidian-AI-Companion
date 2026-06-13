---
title: Diff Preview
description: Review AI edits side-by-side before accepting them into your note.
prev:
  text: Tone Adjustment
  link: /guide/tone
next:
  text: Meeting Notes Formatter
  link: /guide/meeting-notes
---

# 🎨 Diff Preview

Every time AI Companion edits your text, it **never touches your note directly**. Instead, it shows you a diff — a visual comparison of your original text vs. the AI's version — and waits for your approval.

## Two display modes

### ↔️ Side-by-side (default)

Your original text on the left, the AI version on the right. Differences are highlighted in red (removed) and green (added). This is the clearest view for larger edits.

### 🔴🟢 Inline

Changes are shown in a single column. Deleted text is struck through in red, added text is highlighted in green. Better for small edits where the layout barely changes.

**Switch modes** via the toggle in the diff modal header, or set your preferred default in **Settings → Interface → Diff view style**.

## What the diff modal shows

| Element | Description |
|---|---|
| **Word count delta** | e.g. `−12 words / +8 words` — instantly see if the AI made it shorter or longer |
| **Original panel** | Your text, unchanged |
| **AI panel** | The AI's proposed version |
| **Diff highlights** | Red = removed, green = added |
| **Drag handle** | Drag the divider between panels to resize |
| **Accept** | Replaces your selection with the AI version |
| **Reject** | Keeps your original text, closes the modal |

## Accepting or rejecting

- **✅ Accept** — the AI text is inserted into your note at the exact position of your original selection
- **❌ Reject** — nothing changes, your original text is untouched
- **Close (×)** — same as Reject

::: tip Keyboard shortcuts
- <kbd>Enter</kbd> — Accept
- <kbd>Escape</kbd> — Reject / close
:::

## Resize the diff view

Drag the handle between the two panels left or right to give more space to either side. Useful for long documents where you need to read more context.

## Changing the default mode

Go to **Settings → AI Companion → Interface → Diff view style** and choose:
- `Side-by-side` (default) — best for most edits
- `Inline red/green` — compact, good for small grammar fixes

::: info
The mode you set in Settings is the default. You can always toggle between modes inside any open diff modal without changing the setting.
:::
