---
title: Installation
description: How to install the AI Companion plugin for Obsidian — via BRAT, manual install, or the Community Plugins directory.
next:
  text: Quick Start
  link: /guide/quick-start
---

# Installation

Get AI Companion up and running in your Obsidian vault in minutes. Choose the install method that suits you best.

---

## Prerequisites

Before installing, make sure you have:

| Requirement | Minimum Version | Notes |
|---|---|---|
| Obsidian | `1.5.0` | Download at [obsidian.md](https://obsidian.md) |
| An AI API key | — | At least one provider key is required. Gemini offers a **free tier** — see the tip below. |
| Internet connection | — | Required for all AI requests |

::: tip Get a Free Gemini API Key
The fastest way to get started is with Google Gemini — it has a **generous free tier** with no credit card required.

1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Sign in with your Google account
3. Click **Get API key** in the left sidebar
4. Click **Create API key** and copy it

You'll be able to make hundreds of requests per day for free. See [Provider Setup](/guide/providers) for more options.
:::

---

## Install Methods

### Method 1: BRAT (Recommended for Beta)

[BRAT](https://github.com/TfTHacker/obsidian42-brat) (Beta Reviewers Auto-update Tool) is the easiest way to install and stay up-to-date with pre-release versions of the plugin.

**Step 1 — Install BRAT**

If you don't already have BRAT:

1. Open Obsidian **Settings** → **Community plugins**
2. Click **Browse** and search for `BRAT`
3. Install and enable **Obsidian42 - BRAT**

**Step 2 — Add AI Companion via BRAT**

1. Open the Command Palette: <kbd>Cmd</kbd>+<kbd>P</kbd> (Mac) / <kbd>Ctrl</kbd>+<kbd>P</kbd> (Windows/Linux)
2. Type `BRAT: Add a beta plugin` and select it
3. Paste the repository URL:
   ```
   https://github.com/hajorda/ai-companion
   ```
4. Click **Add Plugin**
5. When prompted, click **Enable** to activate immediately

BRAT will automatically check for updates every time you launch Obsidian.

---

### Method 2: Manual Install

Use this method if you prefer to manage the plugin files yourself or are working in an air-gapped environment.

**Step 1 — Download the release**

Go to the [GitHub Releases page](https://github.com/hajorda/ai-companion/releases) and download the latest release assets:

- `main.js`
- `manifest.json`
- `styles.css`

**Step 2 — Place the files in your vault**

1. Navigate to your vault's plugin folder:
   ```
   <your-vault>/.obsidian/plugins/
   ```
2. Create a new folder named `ai-companion`
3. Move the three downloaded files into it:
   ```
   .obsidian/plugins/ai-companion/
   ├── main.js
   ├── manifest.json
   └── styles.css
   ```

**Step 3 — Enable the plugin**

1. Open Obsidian **Settings** → **Community plugins**
2. If prompted, click **Turn on community plugins**
3. Find **AI Companion** in the list and toggle it **on**

::: warning Reload Required
If you installed the files while Obsidian was running, you may need to reload Obsidian (or run the `Reload app without saving` command) before the plugin appears in the list.
:::

---

### Method 3: Community Plugins Directory *(Coming Soon)*

AI Companion is currently in beta and pending review for the official Obsidian Community Plugins directory. Once approved, you'll be able to install it directly:

1. **Settings** → **Community plugins** → **Browse**
2. Search for `AI Companion`
3. Click **Install**, then **Enable**

::: info Stay Updated
Watch the [GitHub repository](https://github.com/hajorda/ai-companion) or follow the developer for announcements on the official Community Plugins release.
:::

---

## Activation Steps

After installing via any method, follow these steps to activate the plugin:

1. **Enable the plugin** in **Settings** → **Community plugins** (toggle on)
2. **Open plugin settings**: click the gear icon next to AI Companion, or go to **Settings** → **AI Companion**
3. **Add your API key** for at least one provider (see [Provider Setup](/guide/providers))
4. **Select a default provider** and model
5. **Close Settings** — the plugin is ready to use

---

## First-Time Setup Checklist

Work through this checklist after installation to make sure everything is configured correctly:

- [ ] Plugin is enabled in **Settings** → **Community plugins**
- [ ] At least one API key is entered and saved
- [ ] Default provider is selected
- [ ] A model is chosen for the default provider (or left at the recommended default)
- [ ] Test the connection by pressing the **Test** button in provider settings — you should see ✅ *Connection successful*
- [ ] Try selecting some text in a note and pressing <kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>A</kbd> to open the inline editor
- [ ] *(Optional)* Enable Model Tiers if you want different models for different task types
- [ ] *(Optional)* Enable Slash Commands if you want `/ai` shortcuts in your notes

::: tip Stuck?
If the **Test** button returns an error, double-check that:
- You copied the full API key without extra spaces
- Your internet connection is active
- Your key has not expired or hit its quota

See [Provider Setup](/guide/providers) for provider-specific troubleshooting tips.
:::
