---
title: Model Browser
description: Use the live model browser to search and select from 300+ AI models across all providers.
prev:
  text: Provider Setup
  link: /guide/providers
next:
  text: Model Tiers
  link: /guide/model-tiers
---

# Model Browser

The Model Browser gives you a live, searchable view of every model available across all your configured providers — all in one place. Browse by provider, filter to free-only models, sort by price or context window, and set a model with a single click.

---

## Opening the Model Browser

There are two ways to open it:

**From Provider Settings:**
1. **Settings** → **AI Companion** → **Providers**
2. Select a provider (e.g., Google Gemini, OpenRouter)
3. Click **Browse 300+ Models** below the model input

**From the Model Tier card:**
1. **Settings** → **AI Companion** → **Model Tiers**
2. Find the tier you want to configure (Fast, Balanced, Powerful, Creative)
3. Click the **Browse** button on that tier's card

The browser opens as a full modal overlay with live data fetched from the provider APIs.

::: info OpenRouter gives the most options
While native providers (Gemini, OpenAI, Claude) show their own model lists, **OpenRouter** gives access to 300+ models from 30+ providers — all with one key. If you want maximum model selection, configure OpenRouter first.
:::

---

## Browser Interface

### Search Bar

Type any part of a model name, provider name, or capability to filter results instantly. The search is case-insensitive and fuzzy.

```
gemini          → shows all Gemini models
70b             → shows all 70B parameter models
vision          → shows models with vision support
flash           → shows all flash/fast variants
```

### Provider Filter Dropdown

Filter the model list to a specific provider family. Available options:

| Filter | Models Shown |
|---|---|
| **All Providers** | Every model across all sources |
| **Google** | Gemini models (Flash, Pro, Ultra) |
| **OpenAI** | GPT-4o, GPT-4.1, o-series |
| **Anthropic** | Claude Haiku, Sonnet, Opus |
| **Meta** | Llama 3.x series |
| **Mistral** | Mistral 7B, Mixtral, Mistral Large |
| **DeepSeek** | DeepSeek V3, R1 series |
| **Qwen** | Qwen 2.5 series (Alibaba) |
| **xAI** | Grok series |
| **NVIDIA** | NVIDIA-hosted models |

### Free Only Checkbox

Check **Free models only** to instantly filter the list to models with no per-token cost. This works with OpenRouter, which hosts many free-tier versions of popular models.

::: tip Finding Free Models
With OpenRouter configured, check **Free only** and you'll typically find 20–40 free models available, including capable options like:
- `meta-llama/llama-3.3-70b-instruct:free`
- `google/gemini-2.0-flash-exp:free`
- `deepseek/deepseek-r1:free`
- `mistralai/mistral-7b-instruct:free`

Free models may have rate limits or lower priority during peak hours, but they're perfectly capable for most writing tasks.
:::

### Sort Options

Sort the model list by:

| Sort Option | Description |
|---|---|
| **Price (Low → High)** | Cheapest input cost first; free models always at top |
| **Price (High → Low)** | Most expensive first — useful for finding premium models |
| **Context Window** | Largest context first — useful for long-document tasks |
| **Name (A → Z)** | Alphabetical by model name |

---

## Price Badge System

Every model card displays a color-coded **price badge** showing the input token cost per 1 million tokens:

| Badge | Color | Price Range | Example |
|---|---|---|---|
| **FREE** | 🟢 Green | $0.00 / 1M tokens | `gemini-2.0-flash-exp:free` |
| **< $1** | 🟩 Light green | Under $1.00 / 1M tokens | `gemini-2.5-flash`, `gpt-4o-mini` |
| **$1 – $10** | 🟡 Yellow | $1.00 – $9.99 / 1M tokens | `gpt-4o`, `claude-sonnet-4` |
| **> $10** | 🔴 Red | $10.00+ / 1M tokens | `claude-opus-4`, `gpt-4` |

::: info How Token Pricing Works
Prices are shown per **1 million input tokens**. For reference:
- 1 million tokens ≈ 750,000 words ≈ about 1,500 typical pages
- A short paragraph is roughly 50–100 tokens
- Most writing tasks in Obsidian cost a fraction of a cent per request

For everyday use, anything in the **FREE** or **< $1** tier will cost virtually nothing.
:::

---

## Modality Icons

Each model card also shows capability icons so you know what the model supports at a glance:

| Icon | Modality |
|---|---|
| 📝 | Text generation |
| 👁️ | Vision / image input |
| 🔊 | Audio input |
| 🖼️ | Image generation |
| ⚡ | Streaming supported |

---

## Refresh Button

The model list is fetched fresh when you open the browser. If you suspect the list is stale (e.g., a new model was just released), click the **Refresh** button in the top-right corner of the modal to force a new fetch from the provider APIs.

---

## Selecting a Model

1. Find the model you want using search, filter, and sort
2. Click the model card
3. The model is immediately set for the current provider or tier
4. Click anywhere outside the modal or press <kbd>Esc</kbd> to close

The selected model name will appear in the model input field in Settings.

::: tip Good Starting Choices
If you're unsure which model to pick, here are safe defaults for common tasks:

| Use Case | Recommended Model |
|---|---|
| Daily writing, edits | `gemini-2.5-flash` or `gpt-4o-mini` |
| Long documents, summaries | `gemini-2.5-pro` or `claude-sonnet-4` |
| Creative writing | `claude-sonnet-4` or `gpt-4o` |
| Free, capable, all-around | `meta-llama/llama-3.3-70b-instruct:free` (via OpenRouter) |
:::
