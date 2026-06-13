# ✦ AI Companion for Obsidian

An elegant, premium, and lightning-fast AI writing assistant integrated directly into Obsidian. 

Edit text, grammar check, summarize, adjust tone, format meeting notes, and query 300+ models via OpenRouter—all with live streaming diff previews directly inside your editor.

📖 **Official Documentation**: [hajorda.github.io/Obsidian-AI-Companion](https://hajorda.github.io/Obsidian-AI-Companion/)

---

## ✨ Key Features

* **✦ Inline AI Editor**: Select text, press `<kbd>Cmd/Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>A</kbd>`, and ask the AI to rewrite, correct, or expand. Response highlights appear in a side-by-side or inline diff preview before you accept.
* **⚡ Live Streaming Diff**: Watch AI tokens replace or insert text in real time with a streaming diff. Accept, reject, or edit the diff before accepting.
* **🔀 300+ Models via OpenRouter**: Support for Google Gemini (including free tier), OpenAI GPT, Anthropic Claude, and OpenRouter for the latest frontier and open-source models.
* **⚖️ Model Tiers**: Assign different models to different task types. Route grammar checks to fast, budget models and full-note summaries to powerful, reasoning models.
* **🎭 Tone Adjustments**: Select text and instantly rewrite it in a **Formal, Casual, Academic, Friendly, or Blunt** tone with one click.
* **📚 Prompt Library**: Save your most useful prompts, organize them by category, choose custom Lucide icons, and pin them to your quick-action list.
* **🕐 Sidebar History Panel**: Live token counter and detailed logs of all past requests, saved persistently to your vault.
* **🤖 Smart Automation**: AI Paste & Refactor (automatically improves text pasted into the editor) and Auto-Title (suggests titles for new notes).

---

## ⌨️ Keyboard Shortcuts

| Command | Shortcut (macOS) | Shortcut (Windows/Linux) | Description |
| :--- | :--- | :--- | :--- |
| **Edit with AI** | <kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>A</kbd> | <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>A</kbd> | Opens the floating popover near your selection |
| **AI Paste & Refactor** | <kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>V</kbd> | <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>V</kbd> | Pastes and improves text using the AI |
| **Submit Prompt** | <kbd>Enter</kbd> | <kbd>Enter</kbd> | Sends prompt to the AI (press <kbd>Shift</kbd>+<kbd>Enter</kbd> for newline) |
| **Close Dialog / Popover** | <kbd>Esc</kbd> | <kbd>Esc</kbd> | Cancels and closes active popover or modals |

---

## 🚀 Installation

### Option 1: Manual Installation (Recommended)
1. Download the latest release assets (`main.js`, `manifest.json`, and `styles.css`).
2. Inside your vault, navigate to `.obsidian/plugins/` and create a folder named `ai-companion`.
3. Copy the downloaded assets into this new folder.
4. Open Obsidian -> **Settings** -> **Community Plugins** -> toggle **AI Companion** on.

### Option 2: Via BRAT (Beta Reviewer's Auto-update Tool)
1. Install the BRAT plugin from the Obsidian Community Plugins repository.
2. Open BRAT settings -> click **Add Beta Plugin**.
3. Enter the repository URL: `https://github.com/Hajorda/Obsidian-AI-Companion`.
4. Click **Add Plugin** and enable it.

---

## 🔑 Getting Started

1. Go to Obsidian **Settings** -> **AI Companion**.
2. Add your API key for your preferred provider:
   - **Google Gemini** (Get a free key at [aistudio.google.com](https://aistudio.google.com/))
   - **OpenAI** (Get a key at [platform.openai.com](https://platform.openai.com/))
   - **Anthropic Claude** (Get a key at [console.anthropic.com](https://console.anthropic.com/))
   - **OpenRouter** (Get a key at [openrouter.ai](https://openrouter.ai/))
3. Select your Default Provider.
4. Select any text in a note and press `<kbd>Cmd/Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>A</kbd>` to trigger your first AI Companion action!

---

## 📄 License

This plugin is released under the [MIT License](LICENSE).
