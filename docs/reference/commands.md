---
title: Keyboard Shortcuts
description: Full list of keyboard shortcuts and commands for AI Companion.
prev:
  text: All Settings
  link: /reference/settings
next:
  text: Changelog
  link: /reference/changelog
---

# ⌨️ Keyboard Shortcuts

## Default shortcuts

| Command | Mac | Windows / Linux |
|---|---|---|
| **Open Inline AI Editor** | <kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>A</kbd> | <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>A</kbd> |
| **AI Paste** (paste + refactor) | <kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>V</kbd> | <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>V</kbd> |

## All registered commands

These commands can be found and assigned custom shortcuts in **Obsidian Settings → Hotkeys**.

| Command name | Description |
|---|---|
| AI Companion: Edit with AI | Opens the inline AI editor for selected text |
| AI Companion: AI Paste | Pastes clipboard content with AI cleanup |
| AI Companion: Summarize note | Summarizes the entire active note |
| AI Companion: Generate title | Suggests a title for the active note |
| AI Companion: Generate tags | Generates 5–10 tags for the active note |
| AI Companion: Continue writing | Continues writing from end of selection |
| AI Companion: Create outline | Generates a structured outline for the note |
| AI Companion: Explain code | Explains selected code in plain English |
| AI Companion: Format as meeting notes | Formats the note as structured meeting minutes |
| AI Companion: Open Prompt Library | Opens the saved prompt library modal |
| AI Companion: Toggle History Panel | Shows or hides the AI request history sidebar |

## Customizing shortcuts

1. Go to **Obsidian Settings** → **Hotkeys**
2. Search for **"AI Companion"**
3. Click the `+` button next to any command
4. Press your desired key combination

::: tip Unassigned commands
Commands without a default shortcut (Summarize, Generate tags, etc.) are accessible via <kbd>Cmd</kbd>+<kbd>P</kbd> (Command Palette). Assign shortcuts to the ones you use most often.
:::

::: info Shortcut conflicts
If a shortcut doesn't work, another plugin or Obsidian itself may be using that key combination. Check **Settings → Hotkeys → Show conflicts** to diagnose.
:::

## Shortcuts inside the AI popup

Once the inline editor popup is open:

| Key | Action |
|---|---|
| <kbd>Tab</kbd> | Move focus between quick action buttons |
| <kbd>Enter</kbd> (on button) | Activate the focused quick action |
| <kbd>↑</kbd> / <kbd>↓</kbd> | Cycle through previous prompts (history) |
| <kbd>Enter</kbd> (in input) | Send the prompt |
| <kbd>Escape</kbd> | Close the popup |

## Shortcuts inside the diff modal

| Key | Action |
|---|---|
| <kbd>Enter</kbd> | Accept the AI edit |
| <kbd>Escape</kbd> | Reject / close |
