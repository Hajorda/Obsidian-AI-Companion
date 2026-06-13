---
title: Model Tiers
description: Assign different AI models to different task types — use a fast, cheap model for grammar and a powerful model for summaries.
prev:
  text: Model Browser
  link: /guide/model-browser
next:
  text: Inline AI Editor
  link: /guide/inline-editor
---

# Model Tiers

Model Tiers let you use a **different AI model for different types of tasks**. A fast, inexpensive model for quick grammar fixes; a powerful, high-quality model for complex summarization. Same workflow — smarter resource allocation.

---

## Why Use Model Tiers?

Without tiers, every AI action uses your default model. That works fine, but it's not optimal:

- **Grammar fixes** don't need a powerful (expensive) model — a small fast model is just as good
- **Meeting note summaries** benefit from a powerful model that can handle nuance and structure
- **Creative rewrites** work best with models trained for tone and voice

Tiers let you match model capability to task complexity — **saving cost and improving quality** at the same time.

---

## The Four Tiers

### ⚡ Fast Tier

**Best for:** Quick, low-complexity tasks that benefit from immediate response

Actions assigned to this tier:
- Grammar & spelling fix
- Tone adjustment
- Translate
- Generate tags
- Generate title

Recommended models: `gemini-2.5-flash`, `gpt-4o-mini`, `claude-haiku-3-5`, `mistral-7b-instruct:free`

---

### ⚖️ Balanced Tier

**Best for:** Mid-complexity writing tasks that need good judgment but not maximum reasoning

Actions assigned to this tier:
- Improve writing
- Elaborate
- Explain

Recommended models: `gemini-2.5-flash`, `gpt-4o`, `claude-sonnet-4`, `llama-3.3-70b-instruct`

---

### 🧠 Powerful Tier

**Best for:** High-complexity tasks requiring deep comprehension of long content

Actions assigned to this tier:
- Summarize note
- Create outline
- Format as meeting notes

Recommended models: `gemini-2.5-pro`, `gpt-4.1`, `claude-sonnet-4`, `deepseek-v3`

---

### 🎨 Creative Tier

**Best for:** Tasks requiring strong voice, style, and creative judgment

Actions assigned to this tier:
- Style rewrites (Hemingway, Journalist, Tweet, Press Release, etc.)
- Continue writing

Recommended models: `claude-sonnet-4`, `claude-opus-4`, `gpt-4o`, `gemini-2.5-pro`

---

## Enabling Model Tiers

Model Tiers are **disabled by default** — all actions use your single default provider and model.

To enable:

1. **Settings** → **AI Companion** → **Model Tiers**
2. Toggle **Enable Model Tiers** to **on**
3. Four tier cards will appear, each with a **Browse & Select** button
4. Click **Browse & Select** on each tier to open the Model Browser and assign a model
5. Close Settings — tiers are now active

::: info Works with All Providers
Each tier can be assigned a model from any of your configured providers — mix and match. For example, use a free OpenRouter model for the Fast tier and a native Gemini model for the Powerful tier.
:::

::: tip Leave tiers on default if unsure
If you don't configure a tier, it falls back to your default provider and model. You can enable tiers and only configure the ones that matter to you.
:::

---

## Example Configurations

Here are some good tier combinations for different goals:

### 🆓 Free-Only Setup (OpenRouter)

| Tier | Model | Cost |
|---|---|---|
| Fast | `google/gemini-2.0-flash-exp:free` | Free |
| Balanced | `meta-llama/llama-3.3-70b-instruct:free` | Free |
| Powerful | `deepseek/deepseek-r1:free` | Free |
| Creative | `mistralai/mistral-small:free` | Free |

### 💰 Budget Setup

| Tier | Model | Est. Cost |
|---|---|---|
| Fast | `gemini-2.5-flash` | ~$0.075/1M in |
| Balanced | `gpt-4o-mini` | ~$0.15/1M in |
| Powerful | `gemini-2.5-flash` | ~$0.075/1M in |
| Creative | `claude-haiku-3-5` | ~$0.25/1M in |

### 🏆 Quality-First Setup

| Tier | Model | Est. Cost |
|---|---|---|
| Fast | `gemini-2.5-flash` | ~$0.075/1M in |
| Balanced | `gpt-4o` | ~$2.50/1M in |
| Powerful | `gemini-2.5-pro` | ~$1.25/1M in |
| Creative | `claude-sonnet-4` | ~$3.00/1M in |

::: warning Cost Awareness
When using high-quality models for the Powerful and Creative tiers, longer notes and frequent use can add up. Monitor your usage in your provider dashboards, especially for OpenAI and Anthropic which are purely pay-as-you-go.
:::

---

## Disabling Tiers

To go back to a single model for all tasks:

1. **Settings** → **AI Companion** → **Model Tiers**
2. Toggle **Enable Model Tiers** to **off**

All actions will immediately return to using your default provider and model.
