// ─── Model Browser Modal ─────────────────────────────────────────────────────
// Full-screen searchable, filterable model picker with live OpenRouter data.
// Can be opened from Settings or from the InlineEditorModal header chip.

import { App, Modal, Notice, setIcon } from "obsidian";
import type { ModelTier } from "../settings/settings";
import {
  ModelInfo,
  ProviderKey,
  PROVIDER_META,
  GEMINI_MODELS,
  OPENAI_MODELS,
  CLAUDE_MODELS,
  fetchOpenRouterModels,
  clearOpenRouterCache,
  formatContextLength,
  formatPrice,
  getPriceBadge,
  getModalityIcons,
  getTierInfo,
} from "../ai/ModelRegistry";

export interface ModelBrowserOptions {
  /** Which provider(s) to show. "all" = show all enabled providers. */
  source: ProviderKey | "all";
  /** API keys (to determine which providers are active) */
  enabledProviders: Partial<Record<ProviderKey, boolean>>;
  /** Currently selected model id */
  currentModel?: string;
  /** If opened from a tier setting, shows "Select for [Tier]" */
  targetTier?: ModelTier;
  /** Callback with the selected model id */
  onSelect: (modelId: string) => void;
}

type SortKey = "price" | "context" | "name" | "newest";

interface FilterState {
  search: string;
  provider: string;   // "all" or provider slug
  freeOnly: boolean;
  sort: SortKey;
}

export class ModelBrowserModal extends Modal {
  private opts: ModelBrowserOptions;
  private allModels: ModelInfo[] = [];
  private filter: FilterState = { search: "", provider: "all", freeOnly: false, sort: "price" };
  private isLoading = false;
  private listEl!: HTMLElement;
  private countEl!: HTMLElement;
  private statusEl!: HTMLElement;

  constructor(app: App, opts: ModelBrowserOptions) {
    super(app);
    this.opts = opts;
    this.modalEl.addClass("aic-browser-modal");
  }

  async onOpen() {
    this.buildShell();
    this.setIsLoading(true);
    await this.loadModels();
    this.setIsLoading(false);
    this.renderList();
  }

  onClose() {
    this.contentEl.empty();
  }

  // ── Shell UI ──────────────────────────────────────────────────────────────

  private buildShell() {
    const { contentEl } = this;
    contentEl.empty();

    // ─ Header ─
    const header = contentEl.createDiv("aic-browser-header");
    const titleRow = header.createDiv("aic-browser-title-row");

    const icon = titleRow.createDiv("aic-browser-icon");
    setIcon(icon, "layers");

    const titleText = titleRow.createDiv("aic-browser-title-text");
    titleText.createEl("h2", { text: "🔀 Model Browser", cls: "aic-browser-h2" });

    const tierTarget = this.opts.targetTier ? getTierInfo(this.opts.targetTier) : null;
    if (tierTarget) {
      titleText.createEl("p", {
        text: `${tierTarget.emoji} Selecting for ${tierTarget.label} tier — ${tierTarget.description}`,
        cls: "aic-browser-subtitle",
      });
    } else {
      titleText.createEl("p", {
        text: "Browse 300+ models. Click to select.",
        cls: "aic-browser-subtitle",
      });
    }

    // Refresh button
    const refreshBtn = header.createEl("button", { cls: "aic-browser-refresh-btn" });
    setIcon(refreshBtn, "refresh-cw");
    refreshBtn.setAttribute("title", "Refresh model list from OpenRouter");
    refreshBtn.addEventListener("click", async () => {
      clearOpenRouterCache();
      this.setIsLoading(true);
      refreshBtn.addClass("aic-spinning");
      await this.loadModels();
      this.setIsLoading(false);
      refreshBtn.removeClass("aic-spinning");
      this.renderList();
    });

    // ─ Controls ─
    const controls = contentEl.createDiv("aic-browser-controls");

    // Search
    const searchWrap = controls.createDiv("aic-browser-search-wrap");
    const searchIcon = searchWrap.createDiv("aic-browser-search-icon");
    setIcon(searchIcon, "search");
    const searchInput = searchWrap.createEl("input", {
      cls: "aic-browser-search",
      placeholder: "Search models, providers...",
    });
    searchInput.addEventListener("input", () => {
      this.filter.search = searchInput.value;
      this.renderList();
    });

    // Filters row
    const filtersRow = controls.createDiv("aic-browser-filters");

    // Provider filter
    const providerWrap = filtersRow.createDiv("aic-browser-filter-group");
    providerWrap.createEl("label", { text: "Provider", cls: "aic-browser-filter-label" });
    const providerSel = providerWrap.createEl("select", { cls: "aic-browser-select" });
    const providerOptions: Array<[string, string]> = [
      ["all", "🌐 All Providers"],
      ["google", "🔵 Google"],
      ["openai", "🟢 OpenAI"],
      ["anthropic", "🟣 Anthropic"],
      ["meta-llama", "🔷 Meta"],
      ["mistralai", "🌊 Mistral"],
      ["deepseek", "🔴 DeepSeek"],
      ["qwen", "🟠 Qwen / Alibaba"],
      ["x-ai", "✖️ xAI / Grok"],
      ["nvidia", "💚 NVIDIA"],
    ];
    for (const [val, label] of providerOptions) {
      providerSel.createEl("option", { value: val, text: label });
    }
    providerSel.addEventListener("change", () => {
      this.filter.provider = providerSel.value;
      this.renderList();
    });

    // Sort
    const sortWrap = filtersRow.createDiv("aic-browser-filter-group");
    sortWrap.createEl("label", { text: "Sort by", cls: "aic-browser-filter-label" });
    const sortSel = sortWrap.createEl("select", { cls: "aic-browser-select" });
    const sortOptions: Array<[SortKey, string]> = [
      ["price", "💰 Price (cheapest first)"],
      ["context", "📐 Context (largest first)"],
      ["name", "🔤 Name (A–Z)"],
      ["newest", "🕐 Newest first"],
    ];
    for (const [val, label] of sortOptions) {
      sortSel.createEl("option", { value: val, text: label });
    }
    sortSel.addEventListener("change", () => {
      this.filter.sort = sortSel.value as SortKey;
      this.renderList();
    });

    // Free only
    const freeWrap = filtersRow.createDiv("aic-browser-filter-group aic-browser-free-wrap");
    const freeLabel = freeWrap.createEl("label", { cls: "aic-browser-free-label" });
    const freeCheck = freeLabel.createEl("input", { type: "checkbox" });
    freeLabel.createSpan({ text: " 🆓 Free models only" });
    freeCheck.addEventListener("change", () => {
      this.filter.freeOnly = freeCheck.checked;
      this.renderList();
    });

    // ─ Status row (loading / count) ─
    const statusRow = contentEl.createDiv("aic-browser-status-row");
    this.statusEl = statusRow.createDiv("aic-browser-status");
    this.countEl = statusRow.createDiv("aic-browser-count");

    // ─ List ─
    this.listEl = contentEl.createDiv("aic-browser-list");
  }

  // ── Data loading ──────────────────────────────────────────────────────────

  private async loadModels() {
    const models: ModelInfo[] = [];
    const { source, enabledProviders } = this.opts;

    const showGoogle    = source === "all" || source === "google";
    const showOpenAI    = source === "all" || source === "openai";
    const showAnthropic = source === "all" || source === "anthropic";
    const showOpenRouter = source === "all" || source === "openrouter";

    if (showGoogle    && enabledProviders.google)    models.push(...GEMINI_MODELS);
    if (showOpenAI    && enabledProviders.openai)    models.push(...OPENAI_MODELS);
    if (showAnthropic && enabledProviders.anthropic) models.push(...CLAUDE_MODELS);

    if (showOpenRouter && enabledProviders.openrouter) {
      try {
        this.setStatus("🔄 Fetching latest models from OpenRouter…");
        const orModels = await fetchOpenRouterModels();
        models.push(...orModels);
        this.setStatus("");
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        this.setStatus(`⚠️ OpenRouter fetch failed: ${msg}`);
        new Notice(`OpenRouter model list failed: ${msg}`, 6000);
      }
    }

    this.allModels = models;
  }

  // ── Filtering & Sorting ───────────────────────────────────────────────────

  private applyFilters(): ModelInfo[] {
    const { search, provider, freeOnly, sort } = this.filter;
    const q = search.toLowerCase();

    let list = this.allModels.filter((m) => {
      if (freeOnly && !m.isFree) return false;
      if (provider !== "all") {
        const pKey = m.providerKey === "openrouter" ? m.providerLabel : m.providerKey;
        if (!pKey.toLowerCase().startsWith(provider.toLowerCase())) return false;
      }
      if (q) {
        const haystack = `${m.name} ${m.providerLabel} ${m.id} ${m.description}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    list = [...list].sort((a, b) => {
      switch (sort) {
        case "price":   return a.inputPricePerM - b.inputPricePerM;
        case "context": return b.contextLength  - a.contextLength;
        case "name":    return a.name.localeCompare(b.name);
        case "newest":  return 0; // already newest-first from API
        default:        return 0;
      }
    });

    return list;
  }

  // ── Render ────────────────────────────────────────────────────────────────

  private renderList() {
    const list = this.applyFilters();
    this.listEl.empty();
    this.countEl.setText(`${list.length} model${list.length !== 1 ? "s" : ""}`);

    if (list.length === 0) {
      const empty = this.listEl.createDiv("aic-browser-empty");
      empty.createEl("div", { text: "🔍", cls: "aic-browser-empty-icon" });
      empty.createEl("p", { text: "No models match your filters." });
      empty.createEl("p", { text: "Try clearing the search or adjusting filters.", cls: "aic-browser-empty-hint" });
      return;
    }

    // Group by provider for OpenRouter multi-provider view
    if (this.opts.source === "all" || this.opts.source === "openrouter") {
      this.renderGrouped(list);
    } else {
      list.forEach((m) => this.renderModelCard(this.listEl, m));
    }
  }

  private renderGrouped(list: ModelInfo[]) {
    // Group models by provider display name
    const groups = new Map<string, ModelInfo[]>();
    for (const m of list) {
      const key = m.providerKey === "openrouter"
        ? (m.providerLabel ?? "other")
        : m.providerKey;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(m);
    }

    // Sort groups: known providers first, then alphabetical
    const providerOrder = ["google", "openai", "anthropic", "meta-llama", "mistralai",
      "deepseek", "qwen", "x-ai", "nvidia"];
    const sortedKeys = [...groups.keys()].sort((a, b) => {
      const ia = providerOrder.indexOf(a);
      const ib = providerOrder.indexOf(b);
      if (ia !== -1 && ib !== -1) return ia - ib;
      if (ia !== -1) return -1;
      if (ib !== -1) return  1;
      return a.localeCompare(b);
    });

    for (const key of sortedKeys) {
      const models = groups.get(key)!;
      const provMeta = PROVIDER_META[key as ProviderKey];
      const emoji = provMeta?.emoji ?? "⚪";
      const label = provMeta?.label ?? key;

      const groupEl = this.listEl.createDiv("aic-browser-group");
      const groupHeader = groupEl.createDiv("aic-browser-group-header");
      groupHeader.createSpan({ text: `${emoji} ${label}`, cls: "aic-browser-group-name" });
      groupHeader.createSpan({ text: `${models.length}`, cls: "aic-browser-group-count" });

      for (const m of models) {
        this.renderModelCard(groupEl, m);
      }
    }
  }

  private renderModelCard(parent: HTMLElement, model: ModelInfo) {
    const card = parent.createDiv("aic-browser-card");
    const isCurrent = model.id === this.opts.currentModel;
    if (isCurrent) card.addClass("aic-browser-card-selected");

    // ── Left: emoji + info ─────────────────────────────────────────────────
    const left = card.createDiv("aic-browser-card-left");
    left.createDiv({ text: model.emoji, cls: "aic-browser-card-emoji" });

    const info = left.createDiv("aic-browser-card-info");
    const nameRow = info.createDiv("aic-browser-card-name-row");
    nameRow.createSpan({ text: model.name, cls: "aic-browser-card-name" });
    if (model.isRecommended) {
      nameRow.createSpan({ text: "⭐ Recommended", cls: "aic-browser-rec-badge" });
    }
    if (isCurrent) {
      nameRow.createSpan({ text: "✓ Current", cls: "aic-browser-current-badge" });
    }

    // Tagline
    info.createDiv({ text: model.tagline, cls: "aic-browser-card-tagline" });

    // Description (truncated, expand on hover via CSS)
    if (model.description) {
      const desc = model.description.length > 120
        ? model.description.slice(0, 120) + "…"
        : model.description;
      info.createDiv({ text: desc, cls: "aic-browser-card-desc" });
    }

    // Meta badges row
    const badges = info.createDiv("aic-browser-card-badges");

    // Context window
    badges.createSpan({
      text: `📐 ${formatContextLength(model.contextLength)}`,
      cls: "aic-browser-badge aic-browser-badge-ctx",
    });

    // Modalities
    const modalityStr = getModalityIcons(model.modalities);
    if (modalityStr) {
      badges.createSpan({
        text: modalityStr,
        cls: "aic-browser-badge aic-browser-badge-mod",
      });
    }

    // Price badge
    const pb = getPriceBadge(model.inputPricePerM);
    const priceBadge = badges.createSpan({ text: `${pb.emoji} ${pb.label}`, cls: `aic-browser-badge ${pb.cls}` });
    if (!model.isFree) {
      priceBadge.setAttribute(
        "title",
        formatPrice(model.inputPricePerM, model.outputPricePerM)
      );
    }

    // ── Right: select button ───────────────────────────────────────────────
    const right = card.createDiv("aic-browser-card-right");

    const tierTarget = this.opts.targetTier ? getTierInfo(this.opts.targetTier) : null;
    const btnText = tierTarget
      ? `${tierTarget.emoji} Select for ${tierTarget.label}`
      : isCurrent
        ? "✓ Selected"
        : "Select";

    const selectBtn = right.createEl("button", {
      text: btnText,
      cls: isCurrent ? "aic-browser-select-btn aic-browser-select-btn-current" : "aic-browser-select-btn",
    });

    selectBtn.addEventListener("click", () => {
      this.opts.onSelect(model.id);
      new Notice(`✓ Model set to ${model.name}`, 2500);
      this.close();
    });

    // Full price tooltip on hover over card
    card.setAttribute("title", model.isFree
      ? `${model.name} — FREE`
      : `${model.name}\nIn: $${model.inputPricePerM.toFixed(3)}/1M tokens\nOut: $${model.outputPricePerM.toFixed(3)}/1M tokens`
    );
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private setIsLoading(loading: boolean) {
    this.isLoading = loading;
    this.listEl?.empty();
    if (loading) {
      const spinner = this.listEl?.createDiv("aic-browser-loading");
      spinner?.createDiv({ cls: "aic-browser-spinner" });
      spinner?.createEl("p", { text: "Loading models…" });
    }
  }

  private setStatus(msg: string) {
    if (this.statusEl) this.statusEl.setText(msg);
  }
}
