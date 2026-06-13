// ─── AI History Sidebar Panel (v2) ────────────────────────────────────────────
// New in v2: live pending entry with animated token counter, auto-refresh on new entries

import { ItemView, WorkspaceLeaf, setIcon } from "obsidian";
import type { AIClient, HistoryEntry, PendingRequest } from "../ai/AIClient";

export const HISTORY_VIEW_TYPE = "aic-history";

export class HistoryPanel extends ItemView {
  private aiClient: AIClient;
  private liveCounterInterval: ReturnType<typeof setInterval> | null = null;

  constructor(leaf: WorkspaceLeaf, aiClient: AIClient) {
    super(leaf);
    this.aiClient = aiClient;
  }

  getViewType(): string { return HISTORY_VIEW_TYPE; }
  getDisplayText(): string { return "AI History"; }
  getIcon(): string { return "clock"; }

  async onOpen() {
    // Register for live updates from AIClient
    this.aiClient.onRequestStart = () => {
      this.render();
      this.startLiveCounter();
    };

    this.aiClient.onRequestEnd = () => {
      this.stopLiveCounter();
      this.render();
    };

    this.aiClient.onTokenUpdate = () => {
      this.updateLiveTokens();
    };

    this.render();
  }

  async onClose() {
    this.stopLiveCounter();
    this.aiClient.onRequestStart = null;
    this.aiClient.onRequestEnd = null;
    this.aiClient.onTokenUpdate = null;
  }

  render() {
    const container = this.containerEl.children[1] as HTMLElement;
    container.empty();
    container.addClass("aic-history-panel");

    // ── Header ────────────────────────────────────────────────────────────────
    const header = container.createEl("div", { cls: "aic-history-header" });
    const titleEl = header.createEl("div", { cls: "aic-history-title" });
    const hIcon = titleEl.createEl("span");
    setIcon(hIcon, "clock");
    titleEl.createEl("span", { text: "AI History" });

    const count = container.createEl("span", { cls: "aic-history-count", text: `${this.aiClient.history.length}` });
    header.appendChild(count);

    const refreshBtn = header.createEl("button", { cls: "aic-history-refresh", attr: { title: "Refresh" } });
    setIcon(refreshBtn, "refresh-cw");
    refreshBtn.addEventListener("click", () => this.render());

    const clearBtn = header.createEl("button", { cls: "aic-history-clear", attr: { title: "Clear history" } });
    setIcon(clearBtn, "trash-2");
    clearBtn.addEventListener("click", () => { this.aiClient.clearHistory(); this.render(); });

    // ── List ──────────────────────────────────────────────────────────────────
    const list = container.createEl("div", { cls: "aic-history-list" });

    // Show live pending entry first
    if (this.aiClient.pendingRequest) {
      this.renderPendingEntry(list, this.aiClient.pendingRequest);
    }

    if (this.aiClient.history.length === 0 && !this.aiClient.pendingRequest) {
      const empty = list.createEl("div", { cls: "aic-history-empty" });
      const emptyIcon = empty.createEl("div", { cls: "aic-history-empty-icon" });
      setIcon(emptyIcon, "sparkles");
      empty.createEl("p", { text: "No AI interactions yet." });
      empty.createEl("p", { text: "Select text → Cmd+Shift+A to start.", cls: "aic-history-empty-hint" });
      return;
    }

    for (const entry of this.aiClient.history) {
      this.renderEntry(list, entry);
    }
  }

  private renderPendingEntry(list: HTMLElement, pending: PendingRequest) {
    const item = list.createEl("div", { cls: "aic-history-item aic-history-pending" });

    const meta = item.createEl("div", { cls: "aic-history-meta" });
    meta.createEl("span", { cls: "aic-history-action", text: pending.action });

    // Animated streaming badge
    if (pending.isStreaming) {
      meta.createEl("span", { cls: "aic-history-streaming-badge", text: "● streaming" });
    } else {
      // Spinner for non-streaming
      const spin = meta.createEl("span", { cls: "aic-history-spinner" });
      setIcon(spin, "loader");
    }

    item.createEl("div", { cls: "aic-history-prompt", text: pending.prompt });

    // Live token counter
    const tokenRow = item.createEl("div", { cls: "aic-history-live-tokens", attr: { id: "aic-live-token-count" } });
    const tokenIcon = tokenRow.createEl("span", { cls: "aic-token-icon" });
    setIcon(tokenIcon, "zap");
    tokenRow.createEl("span", {
      cls: "aic-token-value",
      text: pending.liveTokens > 0 ? `${pending.liveTokens} tokens` : "waiting…",
    });

    // Elapsed time
    const elapsed = item.createEl("div", { cls: "aic-history-elapsed", attr: { id: "aic-live-elapsed" } });
    elapsed.setText(this.formatElapsed(pending.startTime));
  }

  private renderEntry(list: HTMLElement, entry: HistoryEntry) {
    const item = list.createEl("div", { cls: "aic-history-item" });

    const meta = item.createEl("div", { cls: "aic-history-meta" });
    meta.createEl("span", { cls: "aic-history-action", text: entry.action });
    meta.createEl("span", { cls: "aic-history-model", text: `${entry.provider} · ${entry.model}` });
    meta.createEl("span", { cls: "aic-history-time", text: this.formatTime(entry.timestamp) });

    item.createEl("div", {
      cls: "aic-history-prompt",
      text: entry.prompt.slice(0, 80) + (entry.prompt.length > 80 ? "…" : ""),
    });

    const snippet = item.createEl("div", { cls: "aic-history-snippet" });
    const shortText = entry.response.slice(0, 120) + (entry.response.length > 120 ? "…" : "");
    snippet.setText(shortText);

    let expanded = false;
    item.addEventListener("click", () => {
      expanded = !expanded;
      snippet.toggleClass("is-expanded", expanded);
      snippet.setText(expanded ? entry.response : shortText);
    });

    if (entry.tokensUsed) {
      item.createEl("div", { cls: "aic-history-tokens", text: `${entry.tokensUsed} tokens` });
    }
  }

  // ── Live counter helpers ───────────────────────────────────────────────────

  private startLiveCounter() {
    this.stopLiveCounter();
    this.liveCounterInterval = setInterval(() => {
      this.updateLiveElapsed();
    }, 1000);
  }

  private stopLiveCounter() {
    if (this.liveCounterInterval) {
      clearInterval(this.liveCounterInterval);
      this.liveCounterInterval = null;
    }
  }

  private updateLiveTokens() {
    const el = this.containerEl.querySelector("#aic-live-token-count .aic-token-value");
    if (el && this.aiClient.pendingRequest) {
      const tokens = this.aiClient.pendingRequest.liveTokens;
      el.setText(tokens > 0 ? `${tokens} tokens` : "waiting…");
    }
  }

  private updateLiveElapsed() {
    const el = this.containerEl.querySelector("#aic-live-elapsed");
    if (el && this.aiClient.pendingRequest) {
      el.setText(this.formatElapsed(this.aiClient.pendingRequest.startTime));
    }
  }

  private formatElapsed(start: Date): string {
    const sec = Math.floor((Date.now() - start.getTime()) / 1000);
    if (sec < 60) return `${sec}s`;
    return `${Math.floor(sec / 60)}m ${sec % 60}s`;
  }

  private formatTime(date: Date): string {
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return date.toLocaleDateString();
  }
}
