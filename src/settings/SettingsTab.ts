// ─── Settings Tab v3 ──────────────────────────────────────────────────────────
// Full model browser integration, tier routing, OpenRouter, and all providers.

import { App, PluginSettingTab, Setting, Notice, setIcon } from "obsidian";
import type AICompanionPlugin from "../../main";
import type { DiffViewMode, AIProvider, ModelTier } from "./settings";
import { ModelBrowserModal } from "../modals/ModelBrowserModal";
import {
  GEMINI_MODELS, OPENAI_MODELS, CLAUDE_MODELS,
  getTierInfo, getStaticModels,
} from "../ai/ModelRegistry";

export class AICompanionSettingsTab extends PluginSettingTab {
  plugin: AICompanionPlugin;

  constructor(app: App, plugin: AICompanionPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.addClass("aic-settings-container");

    // ── Header ──────────────────────────────────────────────────────────────
    const header = containerEl.createDiv("aic-settings-header");
    header.createDiv({ cls: "aic-settings-logo", text: "✦" });
    header.createEl("h1", { text: "AI Companion" });
    header.createEl("p", {
      text: "Configure providers, models, tiers, and automation.",
      cls: "aic-settings-subtitle",
    });

    // ── Section: Providers ───────────────────────────────────────────────────
    this.sectionHeader(containerEl, "🔑 Providers", "Enter your API keys to activate each provider.");

    this.buildGeminiSection(containerEl);
    this.buildOpenAISection(containerEl);
    this.buildClaudeSection(containerEl);
    this.buildOpenRouterSection(containerEl);

    // ── Section: Default Provider ────────────────────────────────────────────
    this.sectionHeader(containerEl, "🎯 Default Provider");

    new Setting(containerEl)
      .setName("Active provider")
      .setDesc("Which provider handles all requests by default.")
      .addDropdown((drop) => {
        drop.addOption("gemini", "🔵 Google Gemini");
        drop.addOption("openai", "🟢 OpenAI");
        drop.addOption("claude", "🟣 Anthropic Claude");
        drop.addOption("openrouter", "🔀 OpenRouter");
        drop.setValue(this.plugin.settings.defaultProvider);
        drop.onChange(async (value) => {
          this.plugin.settings.defaultProvider = value as AIProvider;
          await this.plugin.saveSettings();
        });
      });

    // ── Section: Model Tiers ─────────────────────────────────────────────────
    this.buildTierSection(containerEl);

    // ── Section: Generation ──────────────────────────────────────────────────
    this.sectionHeader(containerEl, "⚙️ Generation", "Control AI quality and length.");

    new Setting(containerEl)
      .setName("System prompt")
      .setDesc("Injected before every AI request. Defines the AI's persona and behavior.")
      .addTextArea((ta) =>
        ta.setValue(this.plugin.settings.systemPrompt).onChange(async (value) => {
          this.plugin.settings.systemPrompt = value;
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName("Temperature")
      .setDesc("0 = precise and deterministic · 1 = creative and varied. Default: 0.7")
      .addSlider((sl) =>
        sl.setLimits(0, 1, 0.05)
          .setValue(this.plugin.settings.temperature)
          .setDynamicTooltip()
          .onChange(async (value) => {
            this.plugin.settings.temperature = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Max output tokens")
      .setDesc("Maximum number of tokens in any AI response.")
      .addText((t) =>
        t.setValue(String(this.plugin.settings.maxTokens)).onChange(async (value) => {
          const n = parseInt(value);
          if (!isNaN(n) && n > 0) {
            this.plugin.settings.maxTokens = n;
            await this.plugin.saveSettings();
          }
        })
      );

    new Setting(containerEl)
      .setName("⚡ Streaming responses")
      .setDesc("Show AI tokens as they arrive instead of waiting for the full response.")
      .addToggle((tog) =>
        tog.setValue(this.plugin.settings.enableStreaming).onChange(async (value) => {
          this.plugin.settings.enableStreaming = value;
          await this.plugin.saveSettings();
        })
      );

    // ── Section: Interface ───────────────────────────────────────────────────
    this.sectionHeader(containerEl, "🎨 Interface");

    new Setting(containerEl)
      .setName("Diff view style")
      .setDesc("How AI edits are previewed before you accept them.")
      .addDropdown((drop) =>
        drop
          .addOption("sidebyside", "↔️ Side-by-side")
          .addOption("inline", "🔴🟢 Inline red/green")
          .setValue(this.plugin.settings.diffViewMode)
          .onChange(async (value) => {
            this.plugin.settings.diffViewMode = value as DiffViewMode;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("✦ Floating Selection Button")
      .setDesc("Show a tiny purple button near the cursor when text is selected for one-click access to the AI Companion.")
      .addToggle((tog) =>
        tog.setValue(this.plugin.settings.showFloatingButton).onChange(async (value) => {
          this.plugin.settings.showFloatingButton = value;
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName("Show History ribbon icon")
      .setDesc("Show a sparkles icon in the left ribbon to quickly open the AI History panel.")
      .addToggle((tog) =>
        tog.setValue(this.plugin.settings.showHistoryPanel).onChange(async (value) => {
          this.plugin.settings.showHistoryPanel = value;
          await this.plugin.saveSettings();
          this.plugin.updateRibbonIconVisibility();
        })
      );

    // ── Section: Automation ──────────────────────────────────────────────────
    this.sectionHeader(containerEl, "🤖 Automation", "Background AI actions that fire automatically.");

    new Setting(containerEl)
      .setName("Auto-suggest on paste")
      .setDesc("Show an AI refactor suggestion when you paste large amounts of text.")
      .addToggle((tog) =>
        tog.setValue(this.plugin.settings.autoSuggestOnPaste).onChange(async (value) => {
          this.plugin.settings.autoSuggestOnPaste = value;
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName("Paste minimum characters")
      .setDesc("Only trigger the paste suggestion above this character count.")
      .addText((t) =>
        t.setValue(String(this.plugin.settings.autoSuggestMinChars)).onChange(async (value) => {
          const n = parseInt(value);
          if (!isNaN(n) && n > 0) {
            this.plugin.settings.autoSuggestMinChars = n;
            await this.plugin.saveSettings();
          }
        })
      );

    new Setting(containerEl)
      .setName("Auto-title new notes")
      .setDesc("When an Untitled note gets content, show a toast with AI title suggestions.")
      .addToggle((tog) =>
        tog.setValue(this.plugin.settings.autoSuggestTitle).onChange(async (value) => {
          this.plugin.settings.autoSuggestTitle = value;
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName("/ai slash commands")
      .setDesc("Enable /ai commands inside notes (e.g. /ai ask, /ai summary, /ai tags).")
      .addToggle((tog) =>
        tog.setValue(this.plugin.settings.slashCommandsEnabled).onChange(async (value) => {
          this.plugin.settings.slashCommandsEnabled = value;
          await this.plugin.saveSettings();
        })
      );

    // ── Section: History ─────────────────────────────────────────────────────
    this.sectionHeader(containerEl, "💾 History & Persistence");

    new Setting(containerEl)
      .setName("History file path")
      .setDesc("Where to save request history in your vault. Relative to vault root.")
      .addText((t) =>
        t.setValue(this.plugin.settings.historyFilePath).onChange(async (value) => {
          this.plugin.settings.historyFilePath = value.trim();
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName("Max history entries")
      .setDesc("How many past requests to keep. Oldest are removed first.")
      .addText((t) =>
        t.setValue(String(this.plugin.settings.maxHistoryEntries)).onChange(async (value) => {
          const n = parseInt(value);
          if (!isNaN(n) && n > 0) {
            this.plugin.settings.maxHistoryEntries = n;
            await this.plugin.saveSettings();
          }
        })
      );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Provider sections
  // ─────────────────────────────────────────────────────────────────────────────

  private buildGeminiSection(parent: HTMLElement) {
    const s = this.plugin.settings;
    const hasKey = !!s.geminiApiKey;

    const section = parent.createDiv("aic-provider-card" + (hasKey ? " aic-provider-active" : ""));
    const head = section.createDiv("aic-provider-card-head");
    head.createDiv({ text: "🔵", cls: "aic-provider-emoji" });
    const headText = head.createDiv("aic-provider-head-text");
    headText.createEl("strong", { text: "Google Gemini" });
    headText.createEl("span", {
      text: hasKey ? " ✓ Connected" : " — API key required",
      cls: hasKey ? "aic-provider-status-ok" : "aic-provider-status-off",
    });

    // API key
    new Setting(section)
      .setName("API key")
      .setDesc("Get yours free at aistudio.google.com/app/apikey")
      .addText((t) =>
        t.setPlaceholder("AIza...")
          .setValue(s.geminiApiKey)
          .onChange(async (value) => {
            s.geminiApiKey = value.trim();
            await this.plugin.saveSettings();
          })
      )
      .addButton((btn) =>
        btn.setButtonText("Test").setCta().onClick(async () => {
          btn.setButtonText("Testing…").setDisabled(true);
          try {
            await this.plugin.aiClient.testConnection("gemini");
            new Notice("✅ Gemini connected!");
          } catch (err) {
            new Notice(`❌ ${err instanceof Error ? err.message : err}`, 10000);
          }
          btn.setButtonText("Test").setDisabled(false);
        })
      );

    // Model selector with Browse button
    this.buildModelSelector(section, "Default model", "gemini",
      s.geminiModel,
      GEMINI_MODELS.map((m) => [m.id, `${m.emoji} ${m.name} — ${m.tagline}`] as [string, string]),
      async (v) => { s.geminiModel = v; await this.plugin.saveSettings(); }
    );
  }

  private buildOpenAISection(parent: HTMLElement) {
    const s = this.plugin.settings;
    const hasKey = !!s.openaiApiKey;

    const section = parent.createDiv("aic-provider-card" + (hasKey ? " aic-provider-active" : ""));
    const head = section.createDiv("aic-provider-card-head");
    head.createDiv({ text: "🟢", cls: "aic-provider-emoji" });
    const headText = head.createDiv("aic-provider-head-text");
    headText.createEl("strong", { text: "OpenAI" });
    headText.createEl("span", {
      text: hasKey ? " ✓ Connected" : " — API key required",
      cls: hasKey ? "aic-provider-status-ok" : "aic-provider-status-off",
    });

    new Setting(section)
      .setName("API key")
      .setDesc("Get yours at platform.openai.com/api-keys")
      .addText((t) =>
        t.setPlaceholder("sk-...")
          .setValue(s.openaiApiKey)
          .onChange(async (value) => {
            s.openaiApiKey = value.trim();
            await this.plugin.saveSettings();
          })
      )
      .addButton((btn) =>
        btn.setButtonText("Test").setCta().onClick(async () => {
          btn.setButtonText("Testing…").setDisabled(true);
          try {
            await this.plugin.aiClient.testConnection("openai");
            new Notice("✅ OpenAI connected!");
          } catch (err) {
            new Notice(`❌ ${err instanceof Error ? err.message : err}`, 10000);
          }
          btn.setButtonText("Test").setDisabled(false);
        })
      );

    this.buildModelSelector(section, "Default model", "openai",
      s.openaiModel,
      OPENAI_MODELS.map((m) => [m.id, `${m.emoji} ${m.name} — ${m.tagline}`] as [string, string]),
      async (v) => { s.openaiModel = v; await this.plugin.saveSettings(); }
    );
  }

  private buildClaudeSection(parent: HTMLElement) {
    const s = this.plugin.settings;
    const hasKey = !!s.claudeApiKey;

    const section = parent.createDiv("aic-provider-card" + (hasKey ? " aic-provider-active" : ""));
    const head = section.createDiv("aic-provider-card-head");
    head.createDiv({ text: "🟣", cls: "aic-provider-emoji" });
    const headText = head.createDiv("aic-provider-head-text");
    headText.createEl("strong", { text: "Anthropic Claude" });
    headText.createEl("span", {
      text: hasKey ? " ✓ Connected" : " — API key required",
      cls: hasKey ? "aic-provider-status-ok" : "aic-provider-status-off",
    });

    new Setting(section)
      .setName("API key")
      .setDesc("Get yours at console.anthropic.com/settings/keys")
      .addText((t) =>
        t.setPlaceholder("sk-ant-...")
          .setValue(s.claudeApiKey)
          .onChange(async (value) => {
            s.claudeApiKey = value.trim();
            await this.plugin.saveSettings();
          })
      )
      .addButton((btn) =>
        btn.setButtonText("Test").setCta().onClick(async () => {
          btn.setButtonText("Testing…").setDisabled(true);
          try {
            await this.plugin.aiClient.testConnection("claude");
            new Notice("✅ Claude connected!");
          } catch (err) {
            new Notice(`❌ ${err instanceof Error ? err.message : err}`, 10000);
          }
          btn.setButtonText("Test").setDisabled(false);
        })
      );

    this.buildModelSelector(section, "Default model", "anthropic",
      s.claudeModel,
      CLAUDE_MODELS.map((m) => [m.id, `${m.emoji} ${m.name} — ${m.tagline}`] as [string, string]),
      async (v) => { s.claudeModel = v; await this.plugin.saveSettings(); }
    );
  }

  private buildOpenRouterSection(parent: HTMLElement) {
    const s = this.plugin.settings;
    const hasKey = !!s.openrouterApiKey;

    const section = parent.createDiv("aic-provider-card aic-provider-card-openrouter" + (hasKey ? " aic-provider-active" : ""));
    const head = section.createDiv("aic-provider-card-head");
    head.createDiv({ text: "🔀", cls: "aic-provider-emoji" });
    const headText = head.createDiv("aic-provider-head-text");
    headText.createEl("strong", { text: "OpenRouter" });
    headText.createEl("span", {
      text: hasKey ? " ✓ Connected" : " — API key required",
      cls: hasKey ? "aic-provider-status-ok" : "aic-provider-status-off",
    });

    section.createEl("p", {
      text: "One API key, access to 300+ models from Google, Anthropic, OpenAI, Meta, DeepSeek and many more. Includes free models.",
      cls: "aic-provider-desc",
    });

    new Setting(section)
      .setName("API key")
      .setDesc("Get yours free at openrouter.ai/keys")
      .addText((t) =>
        t.setPlaceholder("sk-or-...")
          .setValue(s.openrouterApiKey)
          .onChange(async (value) => {
            s.openrouterApiKey = value.trim();
            await this.plugin.saveSettings();
          })
      )
      .addButton((btn) =>
        btn.setButtonText("Test").setCta().onClick(async () => {
          btn.setButtonText("Testing…").setDisabled(true);
          try {
            await this.plugin.aiClient.testConnection("openrouter");
            new Notice("✅ OpenRouter connected!");
          } catch (err) {
            new Notice(`❌ ${err instanceof Error ? err.message : err}`, 10000);
          }
          btn.setButtonText("Test").setDisabled(false);
        })
      );

    // Default model display + Browse button
    const modelSetting = new Setting(section)
      .setName("Default model")
      .setDesc(`Currently: ${s.openrouterModel}`);

    modelSetting.addButton((btn) =>
      btn.setButtonText("🔀 Browse 300+ Models").setCta().onClick(() => {
        new ModelBrowserModal(this.app, {
          source: "openrouter",
          enabledProviders: { openrouter: true },
          currentModel: s.openrouterModel,
          onSelect: async (modelId) => {
            s.openrouterModel = modelId;
            await this.plugin.saveSettings();
            this.display();
          },
        }).open();
      })
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Tier section
  // ─────────────────────────────────────────────────────────────────────────────

  private buildTierSection(parent: HTMLElement) {
    this.sectionHeader(parent, "⚡ Model Tiers",
      "Use different models for different task types. Faster models for grammar checks, more powerful ones for long summaries."
    );

    new Setting(parent)
      .setName("Enable tier-based model routing")
      .setDesc("When on, each task tier uses its own model instead of the provider default.")
      .addToggle((tog) =>
        tog.setValue(this.plugin.settings.useTierModels).onChange(async (value) => {
          this.plugin.settings.useTierModels = value;
          await this.plugin.saveSettings();
          this.display(); // re-render to show/hide tier rows
        })
      );

    if (!this.plugin.settings.useTierModels) return;

    const tiers: ModelTier[] = ["fast", "balanced", "powerful", "creative"];

    const tierGrid = parent.createDiv("aic-tier-grid");

    for (const tier of tiers) {
      const info = getTierInfo(tier);
      const card = tierGrid.createDiv("aic-tier-card");

      const tierHead = card.createDiv("aic-tier-card-head");
      tierHead.createSpan({ text: info.emoji, cls: "aic-tier-emoji" });
      const tierText = tierHead.createDiv("aic-tier-text");
      tierText.createEl("strong", { text: info.label });
      tierText.createEl("span", { text: info.description, cls: "aic-tier-desc" });

      // Current model display
      const currentModel = this.plugin.settings.tierModels[tier] || "(provider default)";
      const currentEl = card.createDiv("aic-tier-current");
      currentEl.createSpan({ text: "Using: ", cls: "aic-tier-using-label" });
      currentEl.createSpan({ text: currentModel, cls: "aic-tier-model-name" });

      // Browse button
      const btnRow = card.createDiv("aic-tier-btn-row");
      const browseBtn = btnRow.createEl("button", {
        text: "🔀 Browse & Select",
        cls: "aic-tier-browse-btn mod-cta",
      });
      browseBtn.addEventListener("click", () => {
        const p = this.plugin.settings.defaultProvider;
        // For non-OpenRouter providers, show the static list filtered by provider
        new ModelBrowserModal(this.app, {
          source: p === "openrouter" ? "openrouter" : p,
          enabledProviders: {
            google: !!this.plugin.settings.geminiApiKey,
            openai: !!this.plugin.settings.openaiApiKey,
            anthropic: !!this.plugin.settings.claudeApiKey,
            openrouter: !!this.plugin.settings.openrouterApiKey,
          },
          currentModel: this.plugin.settings.tierModels[tier] || undefined,
          targetTier: tier,
          onSelect: async (modelId) => {
            this.plugin.settings.tierModels[tier] = modelId;
            await this.plugin.saveSettings();
            this.display();
          },
        }).open();
      });

      if (this.plugin.settings.tierModels[tier]) {
        const clearBtn = btnRow.createEl("button", {
          text: "✕ Reset",
          cls: "aic-tier-reset-btn",
        });
        clearBtn.addEventListener("click", async () => {
          this.plugin.settings.tierModels[tier] = "";
          await this.plugin.saveSettings();
          this.display();
        });
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────────────────────────

  private buildModelSelector(
    parent: HTMLElement,
    name: string,
    providerKey: string,
    currentValue: string,
    options: Array<[string, string]>,
    onChange: (value: string) => Promise<void>
  ) {
    const setting = new Setting(parent).setName(name);
    setting.addDropdown((drop) => {
      for (const [val, label] of options) {
        drop.addOption(val, label);
      }
      drop.setValue(currentValue);
      drop.onChange(onChange);
    });
  }

  private sectionHeader(parent: HTMLElement, title: string, subtitle?: string) {
    const wrapper = parent.createDiv("aic-section-header");
    wrapper.createEl("h2", { text: title, cls: "aic-section-title" });
    if (subtitle) {
      wrapper.createEl("p", { text: subtitle, cls: "aic-section-subtitle" });
    }
  }
}
