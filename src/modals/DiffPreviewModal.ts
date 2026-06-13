// ─── Diff Preview Modal (v2) ──────────────────────────────────────────────────
// New in v2: word count delta in footer + CSS resize handle

import { App, Modal, Editor, Notice, setIcon } from "obsidian";
import { computeWordDiff, renderInlineDiffHTML } from "../utils/diff";
import type { DiffViewMode } from "../settings/settings";

function wordCount(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

export class DiffPreviewModal extends Modal {
  private editor: Editor;
  private original: string;
  private revised: string;
  private viewMode: DiffViewMode;
  private currentMode: DiffViewMode;

  constructor(
    app: App,
    editor: Editor,
    original: string,
    revised: string,
    viewMode: DiffViewMode
  ) {
    super(app);
    this.editor = editor;
    this.original = original;
    this.revised = revised;
    this.viewMode = viewMode;
    this.currentMode = viewMode;
  }

  onOpen() {
    const { contentEl, modalEl } = this;
    modalEl.addClass("aic-modal", "aic-diff-modal");
    this.renderContent(contentEl);
  }

  private renderContent(contentEl: HTMLElement) {
    contentEl.empty();

    // ── Header ───────────────────────────────────────────────────────────────
    const header = contentEl.createEl("div", { cls: "aic-modal-header" });
    const iconEl = header.createEl("span", { cls: "aic-modal-icon" });
    setIcon(iconEl, "git-diff");
    header.createEl("span", { cls: "aic-modal-title", text: "AI Suggestion" });

    // Mode toggle
    const modeToggle = header.createEl("div", { cls: "aic-mode-toggle" });
    const inlineBtn = modeToggle.createEl("button", {
      cls: "aic-mode-btn" + (this.currentMode === "inline" ? " is-active" : ""),
      text: "Inline",
    });
    const sideBtn = modeToggle.createEl("button", {
      cls: "aic-mode-btn" + (this.currentMode === "sidebyside" ? " is-active" : ""),
      text: "Side-by-side",
    });
    inlineBtn.addEventListener("click", () => { this.currentMode = "inline"; this.renderContent(contentEl); });
    sideBtn.addEventListener("click", () => { this.currentMode = "sidebyside"; this.renderContent(contentEl); });

    // ── Diff container (resizable) ────────────────────────────────────────────
    const diffContainer = contentEl.createEl("div", { cls: "aic-diff-container" });

    if (this.currentMode === "inline") {
      this.renderInlineView(diffContainer);
    } else {
      this.renderSideBySideView(diffContainer);
    }

    // Resize handle
    const resizeHandle = contentEl.createEl("div", { cls: "aic-resize-handle" });
    resizeHandle.createEl("div", { cls: "aic-resize-grip" });
    this.attachResizeHandle(resizeHandle, diffContainer);

    // ── Footer ────────────────────────────────────────────────────────────────
    const footer = contentEl.createEl("div", { cls: "aic-modal-footer aic-diff-footer" });

    // Word count delta
    if (this.original && this.revised) {
      const origWords = wordCount(this.original);
      const revWords = wordCount(this.revised);
      const delta = revWords - origWords;
      const deltaStr = delta > 0 ? `+${delta}` : `${delta}`;
      const deltaClass = delta > 0 ? "aic-wc-added" : delta < 0 ? "aic-wc-removed" : "aic-wc-neutral";
      const wcEl = footer.createEl("div", { cls: "aic-word-count" });
      wcEl.createEl("span", { cls: "aic-wc-label", text: "Words: " });
      wcEl.createEl("span", { cls: "aic-wc-orig", text: `${origWords}` });
      wcEl.createEl("span", { cls: "aic-wc-arrow", text: " → " });
      wcEl.createEl("span", { cls: "aic-wc-rev", text: `${revWords}` });
      wcEl.createEl("span", { cls: `aic-wc-delta ${deltaClass}`, text: ` (${deltaStr})` });
    }

    const btnRow = footer.createEl("div", { cls: "aic-diff-btn-row" });

    const rejectBtn = btnRow.createEl("button", { cls: "aic-btn-reject" });
    setIcon(rejectBtn.createEl("span"), "x");
    rejectBtn.createEl("span", { text: "Reject" });
    rejectBtn.addEventListener("click", () => { this.close(); new Notice("✖ Changes rejected."); });

    const acceptEditBtn = btnRow.createEl("button", { cls: "aic-btn-accept-edit" });
    setIcon(acceptEditBtn.createEl("span"), "pencil");
    acceptEditBtn.createEl("span", { text: "Accept & Edit" });
    acceptEditBtn.addEventListener("click", () => { this.applyChange(); this.close(); new Notice("✏️ Applied — you can now edit."); });

    const acceptBtn = btnRow.createEl("button", { cls: "aic-btn-accept mod-cta" });
    setIcon(acceptBtn.createEl("span"), "check");
    acceptBtn.createEl("span", { text: "Accept" });
    acceptBtn.addEventListener("click", () => { this.applyChange(); this.close(); new Notice("✅ Changes applied."); });
  }

  private renderInlineView(container: HTMLElement) {
    container.addClass("aic-diff-inline");
    const chunks = computeWordDiff(this.original, this.revised);
    const view = container.createEl("div", { cls: "aic-diff-inline-content" });
    view.innerHTML = renderInlineDiffHTML(chunks);
  }

  private renderSideBySideView(container: HTMLElement) {
    container.addClass("aic-diff-sidebyside");

    const origPanel = container.createEl("div", { cls: "aic-diff-panel aic-diff-original" });
    origPanel.createEl("div", { cls: "aic-diff-panel-label", text: "Original" });
    const origContent = origPanel.createEl("div", { cls: "aic-diff-panel-content" });

    const revPanel = container.createEl("div", { cls: "aic-diff-panel aic-diff-revised" });
    revPanel.createEl("div", { cls: "aic-diff-panel-label", text: "AI Suggested" });
    const revContent = revPanel.createEl("div", { cls: "aic-diff-panel-content" });

    const chunks = computeWordDiff(this.original, this.revised);
    let origHtml = "";
    let revHtml = "";

    for (const chunk of chunks) {
      const escaped = chunk.value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

      if (chunk.type === "equal") {
        origHtml += `<span class="aic-diff-eq">${escaped}</span>`;
        revHtml += `<span class="aic-diff-eq">${escaped}</span>`;
      } else if (chunk.type === "delete") {
        origHtml += `<mark class="aic-diff-del">${escaped}</mark>`;
      } else if (chunk.type === "insert") {
        revHtml += `<mark class="aic-diff-ins">${escaped}</mark>`;
      }
    }

    origContent.innerHTML = origHtml;
    revContent.innerHTML = revHtml;
  }

  private attachResizeHandle(handle: HTMLElement, container: HTMLElement) {
    let startY = 0;
    let startHeight = 0;

    const onMouseMove = (e: MouseEvent) => {
      const newHeight = Math.max(120, Math.min(700, startHeight + (e.clientY - startY)));
      container.style.height = `${newHeight}px`;
      container.style.maxHeight = `${newHeight}px`;
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      handle.removeClass("aic-resize-active");
    };

    handle.addEventListener("mousedown", (e) => {
      e.preventDefault();
      startY = e.clientY;
      startHeight = container.getBoundingClientRect().height;
      handle.addClass("aic-resize-active");
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    });
  }

  private applyChange() {
    const from = this.editor.getCursor("from");
    const to = this.editor.getCursor("to");
    this.editor.replaceRange(this.revised, from, to);
  }

  onClose() {
    this.contentEl.empty();
  }
}
