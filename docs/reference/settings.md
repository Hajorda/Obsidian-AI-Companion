---
title: All Settings
description: Complete reference for every setting in AI Companion.
prev:
  text: History Panel
  link: /guide/history
next:
  text: Keyboard Shortcuts
  link: /reference/commands
---

# ⚙️ All Settings Reference

Open settings via **Settings → Community Plugins → AI Companion → ⚙️** (gear icon).

---

## 🔑 Providers

### Google Gemini

| Setting | Default | Description |
|---|---|---|
| Gemini API key | *(empty)* | Your key from [aistudio.google.com](https://aistudio.google.com/app/apikey). Free tier available. |
| Gemini model | `gemini-2.5-flash` | Default model for all Gemini requests. Click Browse to pick from the full list. |

### OpenAI

| Setting | Default | Description |
|---|---|---|
| OpenAI API key | *(empty)* | Your key from [platform.openai.com](https://platform.openai.com/api-keys). |
| OpenAI model | `gpt-4o-mini` | Default model. Click Browse to pick from the full list. |

### Anthropic Claude

| Setting | Default | Description |
|---|---|---|
| Claude API key | *(empty)* | Your key from [console.anthropic.com](https://console.anthropic.com/settings/keys). |
| Claude model | `claude-haiku-4-5` | Default model. Click Browse to pick from the full list. |

### OpenRouter

| Setting | Default | Description |
|---|---|---|
| OpenRouter API key | *(empty)* | Your key from [openrouter.ai/keys](https://openrouter.ai/keys). One key unlocks 300+ models. |
| OpenRouter model | `google/gemini-2.5-flash` | Default model for OpenRouter requests. Click "Browse 300+ Models" to pick. |

---

## 🎯 Default Provider

| Setting | Default | Description |
|---|---|---|
| Active provider | `gemini` | Which provider handles all requests. Options: Gemini, OpenAI, Claude, OpenRouter. |

---

## ⚡ Model Tiers

| Setting | Default | Description |
|---|---|---|
| Enable tier-based routing | `off` | When on, each action tier uses a different model instead of the provider default. |
| ⚡ Fast tier model | *(provider default)* | Model used for grammar, tone, translate, tags, title. |
| ⚖️ Balanced tier model | *(provider default)* | Model used for improve, explain, elaborate. |
| 🧠 Powerful tier model | *(provider default)* | Model used for summarize, outline, meeting notes. |
| 🎨 Creative tier model | *(provider default)* | Model used for style rewrites and continue writing. |

Click **Browse & Select** on any tier card to open the full model browser.

---

## ⚙️ Generation

| Setting | Default | Description |
|---|---|---|
| System prompt | *(see below)* | Injected before every AI request. Defines the AI's persona and behavior. |
| Temperature | `0.7` | 0 = precise/deterministic, 1 = creative/varied. |
| Max output tokens | `2048` | Maximum tokens in any AI response. Increase for longer outputs. |
| Streaming responses | `on` | Show tokens as they arrive (live streaming) instead of waiting for the full response. |

**Default system prompt:**
```
You are a helpful writing assistant integrated into Obsidian. Be concise and precise.
When editing text, return only the edited text without explanation unless asked.
```

---

## 🎨 Interface

| Setting | Default | Description |
|---|---|---|
| Diff view style | `Side-by-side` | How AI edits are shown. Options: Side-by-side, Inline red/green. |

---

## 🤖 Automation

| Setting | Default | Description |
|---|---|---|
| Auto-suggest on paste | `on` | Show AI refactor offer when you paste large amounts of text. |
| Paste minimum characters | `200` | Only trigger the paste suggestion above this character count. |
| Auto-title new notes | `on` | When an Untitled note reaches 150 chars, offer AI title suggestions. |
| /ai slash commands | `on` | Enable `/ai` commands inside notes. |

---

## 💾 History & Persistence

| Setting | Default | Description |
|---|---|---|
| History file path | `_ai-companion/history.json` | Where to save request history in your vault (relative to vault root). |
| Max history entries | `200` | How many past requests to keep. Oldest are removed automatically. |
