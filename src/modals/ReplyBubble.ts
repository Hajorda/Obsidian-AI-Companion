// ─── Reply Bubble / Q&A Panel (v2) ────────────────────────────────────────────
// New in v2: streaming mode with live token append + typing cursor

import { App, Modal, Editor, Notice, MarkdownRenderer, setIcon } from "obsidian";
import { insertBelow } from "../utils/textUtils";

export class ReplyBubble extends Modal {
  private editor: Editor;
  private response: string;
  private question: string;
  private streamingMode = false;
  private responseBodyEl: HTMLElement | null = null;
  private accumulatedText = "";
  private isFinalized = false;

  constructor(app: App, editor: Editor, response: string, question: string) {
    super(app);
    this.editor = editor;
    this.response = response;
    this.question = question;
  }

  // ── Call this instead of open() to enter streaming mode ───────────────────
  openStreaming(): this {
    this.streamingMode = true;
    this.accumulatedText = "";
    this.open();
    return this;
  }

  // ── Called for each streaming chunk ──────────────────────────────────────
  appendChunk(text: string) {
    this.accumulatedText += text;
    if (this.responseBodyEl) {
      // During streaming: fast plain-text render
      this.responseBodyEl.setText(this.accumulatedText);
    }
  }

  // ── Called when streaming is complete ────────────────────────────────────
  finalizeStreaming() {
    this.isFinalized = true;
    this.response = this.accumulatedText;

    // Re-render as markdown now that we have the full text
    if (this.responseBodyEl) {
      this.responseBodyEl.empty();
      MarkdownRenderer.render(
        this.app,
        this.response,
        this.responseBodyEl,
        "",
        null as unknown as import("obsidian").Component
      ).catch(() => {
        this.responseBodyEl?.setText(this.response);
      });
    }

    // Remove streaming cursor + enable footer buttons
    const cursor = this.contentEl.querySelector(".aic-streaming-cursor");
    cursor?.remove();

    const footer = this.contentEl.querySelector(".aic-modal-footer");
    if (footer) {
      footer.removeClass("aic-footer-streaming");
      footer.querySelectorAll("button").forEach((b) => b.removeAttribute("disabled"));
    }
  }

  onOpen() {
    const { contentEl, modalEl } = this;
    modalEl.addClass("aic-modal", "aic-reply-modal");

    // ── Header ───────────────────────────────────────────────────────────────
    const header = contentEl.createEl("div", { cls: "aic-modal-header" });
    const iconEl = header.createEl("span", { cls: "aic-modal-icon" });
    setIcon(iconEl, "message-circle");
    header.createEl("span", { cls: "aic-modal-title", text: "AI Reply" });

    if (this.streamingMode) {
      header.createEl("span", { cls: "aic-streaming-live-badge", text: "● Live" });
    }

    // ── Question echo ─────────────────────────────────────────────────────────
    if (this.question) {
      const questionEl = contentEl.createEl("div", { cls: "aic-reply-question" });
      const qIcon = questionEl.createEl("span", { cls: "aic-reply-q-icon" });
      setIcon(qIcon, "user");
      questionEl.createEl("span", {
        cls: "aic-reply-q-text",
        text: this.question.slice(0, 100) + (this.question.length > 100 ? "…" : ""),
      });
    }

    // ── Response area ─────────────────────────────────────────────────────────
    const responseEl = contentEl.createEl("div", { cls: "aic-reply-response" });
    const aiIcon = responseEl.createEl("span", { cls: "aic-reply-ai-icon" });
    setIcon(aiIcon, "sparkles");
    this.responseBodyEl = responseEl.createEl("div", { cls: "aic-reply-body" });

    if (this.streamingMode) {
      // Start with streaming cursor
      this.responseBodyEl.createEl("span", { cls: "aic-streaming-cursor" });
    } else {
      // Immediate full render
      MarkdownRenderer.render(
        this.app,
        this.response,
        this.responseBodyEl,
        "",
        null as unknown as import("obsidian").Component
      ).catch(() => {
        this.responseBodyEl?.setText(this.response);
      });
    }

    // ── Footer ────────────────────────────────────────────────────────────────
    const footer = contentEl.createEl("div", {
      cls: "aic-modal-footer" + (this.streamingMode ? " aic-footer-streaming" : ""),
    });

    const copyBtn = footer.createEl("button", {
      cls: "aic-btn-copy",
      attr: this.streamingMode ? { disabled: "" } : {},
    });
    setIcon(copyBtn.createEl("span"), "copy");
    copyBtn.createEl("span", { text: "Copy" });
    copyBtn.addEventListener("click", async () => {
      await navigator.clipboard.writeText(this.response || this.accumulatedText);
      new Notice("📋 Copied to clipboard.");
    });

    const insertBtn = footer.createEl("button", {
      cls: "aic-btn-insert",
      attr: this.streamingMode ? { disabled: "" } : {},
    });
    setIcon(insertBtn.createEl("span"), "arrow-down-to-line");
    insertBtn.createEl("span", { text: "Insert below" });
    insertBtn.addEventListener("click", () => {
      insertBelow(this.editor, this.response || this.accumulatedText);
      this.close();
      new Notice("📌 Inserted below selection.");
    });

    const closeBtn = footer.createEl("button", { cls: "aic-btn-close" });
    setIcon(closeBtn.createEl("span"), "x");
    closeBtn.createEl("span", { text: "Dismiss" });
    closeBtn.addEventListener("click", () => this.close());
  }

  onClose() {
    this.responseBodyEl = null;
    this.contentEl.empty();
  }
}
