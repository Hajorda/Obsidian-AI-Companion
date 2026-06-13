---
title: Provider Setup
description: Configure Google Gemini, OpenAI, Anthropic Claude, and OpenRouter API keys in AI Companion.
prev:
  text: Quick Start
  link: /guide/quick-start
next:
  text: Model Browser
  link: /guide/model-browser
---

# Provider Setup

AI Companion supports four AI providers. You only need to configure one to get started, but you can add multiple and switch between them at any time — or use different providers for different task tiers.

---

## Overview

| Provider | Free Tier | Best For | Key Location |
|---|---|---|---|
| **Google Gemini** | ✅ Yes | Getting started, daily use | [aistudio.google.com](https://aistudio.google.com) |
| **OpenAI** | ❌ Pay-as-you-go | GPT-4 quality, broad ecosystem | [platform.openai.com](https://platform.openai.com/api-keys) |
| **Anthropic Claude** | ❌ Pay-as-you-go | Long documents, nuanced writing | [console.anthropic.com](https://console.anthropic.com) |
| **OpenRouter** | ✅ Free models available | 300+ models with one key | [openrouter.ai/keys](https://openrouter.ai/keys) |

---

## Google Gemini

### Getting Your API Key

1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Sign in with any Google account
3. Click **Get API key** in the left sidebar
4. Click **Create API key** → select a Google Cloud project (or create a new one)
5. Copy the key — it starts with `AIza...`

::: tip Free Tier Details
The Gemini free tier (as of 2026) includes:
- **Gemini 2.5 Flash**: 1,500 requests/day, 1 million tokens/minute
- No credit card required
- Keys do not expire

This is more than enough for personal daily use in Obsidian.
:::

### Configuring in AI Companion

1. **Settings** → **AI Companion** → **Providers** → **Google Gemini**
2. Paste your key in the **API Key** field
3. Click **Test** — you should see ✅ *Connection successful*
4. Select a model from the **Model** dropdown

### Recommended Models

| Model | Speed | Quality | Best For |
|---|---|---|---|
| `gemini-2.5-flash` ⭐ | Fast | High | Daily writing tasks (recommended) |
| `gemini-2.5-pro` | Slower | Highest | Complex summarization, reasoning |
| `gemini-1.5-flash` | Very fast | Good | Quick edits, grammar fixes |

::: info Model Browser
Click **Browse 300+ Models** to open the live model browser and see all available Gemini models with context window sizes and pricing. See [Model Browser](/guide/model-browser).
:::

---

## OpenAI

### Getting Your API Key

1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign in or create an account
3. Navigate to **API Keys** in the left sidebar (or go directly to [platform.openai.com/api-keys](https://platform.openai.com/api-keys))
4. Click **Create new secret key**
5. Give it a name (e.g., `obsidian-ai-companion`) and click **Create secret key**
6. Copy the key immediately — it starts with `sk-...` and **will not be shown again**

::: warning Save Your Key
OpenAI only shows the full API key once at creation time. If you lose it, you'll need to create a new one. Store it somewhere safe like a password manager.
:::

### Configuring in AI Companion

1. **Settings** → **AI Companion** → **Providers** → **OpenAI**
2. Paste your key in the **API Key** field
3. Click **Test** to verify the connection
4. Select a model from the **Model** dropdown

### Recommended Models

| Model | Speed | Quality | Cost | Best For |
|---|---|---|---|---|
| `gpt-4o-mini` ⭐ | Fast | Very good | ~$0.15/1M in | Budget-conscious daily use (recommended) |
| `gpt-4o` | Medium | Excellent | ~$2.50/1M in | High-quality rewrites |
| `gpt-4.1` | Medium | Excellent | ~$2.00/1M in | Complex tasks |
| `o4-mini` | Slower | Best | ~$1.10/1M in | Reasoning-heavy tasks |

::: tip Control Your Costs
Set a **monthly spending limit** in the OpenAI dashboard under **Billing** → **Usage limits**. A $5–10/month limit is plenty for typical Obsidian use with `gpt-4o-mini`.
:::

---

## Anthropic Claude

### Getting Your API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign in or create an account
3. Navigate to **API Keys** in the left sidebar
4. Click **Create Key**
5. Give it a name and click **Create Key**
6. Copy the key — it starts with `sk-ant-...`

### Configuring in AI Companion

1. **Settings** → **AI Companion** → **Providers** → **Anthropic Claude**
2. Paste your key in the **API Key** field
3. Click **Test** to verify the connection
4. Select a model from the **Model** dropdown

### Recommended Models

| Model | Speed | Quality | Cost | Best For |
|---|---|---|---|---|
| `claude-haiku-3-5` ⭐ | Very fast | Good | ~$0.25/1M in | Quick edits, grammar (recommended) |
| `claude-sonnet-4` | Medium | Excellent | ~$3.00/1M in | Long-form writing, analysis |
| `claude-opus-4` | Slow | Best | ~$15.00/1M in | Complex creative tasks |

::: info Claude's Strengths
Claude models excel at:
- **Long documents** — very large context windows (up to 200K tokens)
- **Nuanced tone** — particularly good at matching voice and style
- **Instruction following** — reliable at complex, multi-step prompts
:::

---

## OpenRouter

OpenRouter is a unified API gateway that gives you access to **300+ models from 30+ providers** with a single API key. This includes many **free models** with no cost per request.

### Getting Your API Key

1. Go to [openrouter.ai](https://openrouter.ai)
2. Sign in with Google, GitHub, or email
3. Navigate to **Keys** → [openrouter.ai/keys](https://openrouter.ai/keys)
4. Click **Create Key**
5. Give it a name and (optionally) set a credit limit
6. Copy the key — it starts with `sk-or-...`

::: tip Free Models on OpenRouter
Many models on OpenRouter are completely free, including:
- `google/gemini-2.0-flash-exp:free`
- `meta-llama/llama-3.3-70b-instruct:free`
- `mistralai/mistral-7b-instruct:free`
- `deepseek/deepseek-r1:free`

Use the **Free only** filter in the Model Browser to find them. See [Model Browser](/guide/model-browser).
:::

### Configuring in AI Companion

1. **Settings** → **AI Companion** → **Providers** → **OpenRouter**
2. Paste your key in the **API Key** field
3. Click **Test** to verify the connection
4. Click **Browse 300+ Models** to pick a model, or type a model ID manually

### Recommended Starting Models

| Model ID | Notes |
|---|---|
| `google/gemini-2.5-flash` | Fast, high quality |
| `anthropic/claude-haiku-3-5` | Great for writing tasks |
| `meta-llama/llama-3.3-70b-instruct:free` | **Free**, very capable |
| `deepseek/deepseek-v3` | Excellent reasoning, low cost |

::: info One Key, All Providers
With OpenRouter, you don't need separate API keys for Gemini, Claude, OpenAI, etc. OpenRouter routes your request to the underlying provider and bills centrally. This is ideal if you want to experiment with many different models.
:::

---

## Testing Your Connection

Every provider card has a **Test** button. Click it after entering your key:

- ✅ **Connection successful** — your key is valid and the selected model is reachable
- ❌ **Invalid API key** — double-check you copied the full key without leading/trailing spaces
- ❌ **Model not found** — the selected model may be unavailable in your region or tier; try a different model
- ❌ **Quota exceeded** — you've hit your free tier limit or billing needs to be set up

::: warning Key Security
Your API keys are stored in your vault's `.obsidian/plugins/ai-companion/data.json` file. This file is **not** synced to Obsidian Sync by default, but if you use a third-party sync service, make sure your `.obsidian` folder is excluded from public repositories or shared sync.
:::
