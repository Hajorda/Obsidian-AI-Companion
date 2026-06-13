// ─── Inline Editor Modal (v2) ─────────────────────────────────────────────────
// New in v2: ↑↓ prompt history, keyboard nav, custom quick actions,
//            prompt library button, streaming support for answer intent

import { App, Modal, Editor, Notice, setIcon } from "obsidian";
import type { AIClient } from "../ai/AIClient";
import type { PromptAction } from "../ai/prompts";
import { classifyResponseIntent } from "../ai/prompts";
import { inlineDiffManager, getSelectionOffsets } from "../editor/InlineDiffManager";
import { DiffPreviewModal } from "./DiffPreviewModal";
import { ReplyBubble } from "./ReplyBubble";
import { PromptLibraryModal } from "./PromptLibraryModal";
import type { AICompanionSettings, CustomQuickAction, PromptLibraryItem } from "../settings/settings";


interface QuickAction {
  icon: string;
  label: string;
  action: PromptAction;
  isCustom?: boolean;
  customPrompt?: string;
}

const BUILTIN_QUICK_ACTIONS: QuickAction[] = [];

export class InlineEditorModal extends Modal {
  private editor: Editor;
  private selectedText: string;
  private aiClient: AIClient;
  private settings: AICompanionSettings;
  private sessionPromptHistory: string[];
  private promptHistoryIndex = -1;
  private inputEl!: HTMLTextAreaElement;
  private onSaveLibrary: (lib: PromptLibraryItem[]) => Promise<void>;
  /** CM6 selection offsets captured at open time, before the modal steals focus */
  private selOffsets: { from: number; to: number } | null = null;

  constructor(
    app: App,
    editor: Editor,
    selectedText: string,
    aiClient: AIClient,
    settings: AICompanionSettings,
    sessionPromptHistory: string[],
    onSaveLibrary: (lib: PromptLibraryItem[]) => Promise<void>
  ) {
    super(app);
    this.editor = editor;
    this.selectedText = selectedText;
    this.aiClient = aiClient;
    this.settings = settings;
    this.sessionPromptHistory = sessionPromptHistory;
    this.onSaveLibrary = onSaveLibrary;
    // Capture CM6 selection offsets NOW before the modal opens and steals focus
    this.selOffsets = getSelectionOffsets(editor);
  }

  onOpen() {
    const { contentEl, modalEl } = this;
    modalEl.addClass("aic-modal", "aic-inline-editor");

    // ── Header ───────────────────────────────────────────────────────────────
    const header = contentEl.createEl("div", { cls: "aic-modal-header" });
    const iconEl = header.createEl("span", { cls: "aic-modal-icon" });
    setIcon(iconEl, "sparkles");
    header.createEl("span", { cls: "aic-modal-title", text: "AI Companion" });

    // Streaming badge
    if (this.settings.enableStreaming) {
      const badge = header.createEl("span", { cls: "aic-streaming-badge", text: "⚡ Streaming" });
      badge.title = "AI responses will stream in real-time";
    }

    // ── Selection preview ─────────────────────────────────────────────────────
    const preview = contentEl.createEl("div", { cls: "aic-selection-preview" });
    preview.createEl("span", { cls: "aic-selection-label", text: "Selected: " });
    preview.createEl("span", {
      cls: "aic-selection-excerpt",
      text: this.selectedText.slice(0, 120) + (this.selectedText.length > 120 ? "…" : ""),
    });

    // ── Quick actions (built-in + custom + pinned library) ────────────────────
    const allActions: QuickAction[] = [
      ...BUILTIN_QUICK_ACTIONS,
      ...this.settings.customQuickActions.map((cqa) => ({
        icon: cqa.icon || "zap",
        label: cqa.label,
        action: "custom" as PromptAction,
        isCustom: true,
        customPrompt: cqa.prompt,
      })),
      ...this.settings.promptLibrary
        .filter((p) => p.showInQuickActions)
        .map((p) => ({
          icon: p.icon || "bookmark",
          label: p.name,
          action: "custom" as PromptAction,
          isCustom: true,
          customPrompt: p.prompt,
        })),
    ];

    const quickBar = contentEl.createEl("div", { cls: "aic-quick-actions" });

    allActions.forEach((qa, idx) => {
      if (idx === BUILTIN_QUICK_ACTIONS.length && this.settings.customQuickActions.length > 0) {
        quickBar.createEl("div", { cls: "aic-quick-divider" });
      }

      const btn = quickBar.createEl("button", {
        cls: "aic-quick-btn" + (qa.isCustom ? " aic-quick-btn-custom" : ""),
        attr: { title: qa.label, tabindex: "0" },
      });
      const btnIcon = btn.createEl("span", { cls: "aic-quick-btn-icon" });
      setIcon(btnIcon, qa.icon);
      btn.createEl("span", { text: qa.label });

      btn.addEventListener("click", () => {
        if (qa.isCustom && qa.customPrompt) {
          this.runCustomAction(qa.customPrompt);
        } else {
          this.runAction(qa.action, "");
        }
      });

      // Keyboard: Enter/Space already work on buttons natively
    });

    // ── Input area ────────────────────────────────────────────────────────────
    const inputArea = contentEl.createEl("div", { cls: "aic-input-area" });

    // Top row: history hint + library button
    const inputToolbar = inputArea.createEl("div", { cls: "aic-input-toolbar" });
    if (this.sessionPromptHistory.length > 0) {
      inputToolbar.createEl("span", {
        cls: "aic-history-hint",
        text: "↑↓ for history",
      });
    }

    const libBtn = inputToolbar.createEl("button", { cls: "aic-lib-open-btn", attr: { title: "Open Prompt Library" } });
    const libIcon = libBtn.createEl("span", { cls: "aic-lib-open-icon" });
    setIcon(libIcon, "library");
    libBtn.createEl("span", { text: "Library" });
    libBtn.addEventListener("click", () => {
      new PromptLibraryModal(
        this.app,
        this.settings.promptLibrary,
        this.onSaveLibrary,
        "select",
        (item) => {
          this.inputEl.value = item.prompt;
          this.inputEl.focus();
        }
      ).open();
    });

    this.inputEl = inputArea.createEl("textarea", {
      cls: "aic-prompt-input",
      attr: { placeholder: "What would you like to do with this text? (↑↓ for history)", rows: "3" },
    });

    // ↑↓ prompt history navigation
    this.inputEl.addEventListener("keydown", (e) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        this.navigateHistory(1);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        this.navigateHistory(-1);
      } else if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.runAction("custom", this.inputEl.value);
      }
    });

    // Save to library button (shown inline below input)
    const saveToLibWrap = inputArea.createEl("div", { cls: "aic-save-to-lib-wrap" });
    const saveToLibBtn = saveToLibWrap.createEl("button", { cls: "aic-save-to-lib-btn" });
    setIcon(saveToLibBtn.createEl("span"), "bookmark-plus");
    saveToLibBtn.createEl("span", { text: "Save to Library" });
    saveToLibBtn.addEventListener("click", () => {
      const prompt = this.inputEl.value.trim();
      if (!prompt) { new Notice("Type a prompt first to save it."); return; }
      // Open library modal in manage mode with pre-filled prompt
      const newItem: PromptLibraryItem = {
        id: "__new__",
        name: "",
        prompt,
        category: "General",
      };
      // We'll open the library in manage mode
      const modal = new PromptLibraryModal(
        this.app,
        this.settings.promptLibrary,
        this.onSaveLibrary,
        "manage"
      );
      modal.open();
      new Notice("📚 Open a prompt in library, then paste your prompt there.");
    });

    // ── Footer: send ──────────────────────────────────────────────────────────
    const footer = contentEl.createEl("div", { cls: "aic-modal-footer" });
    this.renderSendButton(footer);

    setTimeout(() => this.inputEl.focus(), 50);
  }

  private renderSendButton(footer: HTMLElement) {
    footer.empty();
    const sendBtn = footer.createEl("button", { cls: "aic-send-btn mod-cta" });
    setIcon(sendBtn.createEl("span"), "send");
    sendBtn.createEl("span", { text: "Send" });
    sendBtn.addEventListener("click", () => this.runAction("custom", this.inputEl.value));
  }

  private navigateHistory(dir: 1 | -1) {
    if (this.sessionPromptHistory.length === 0) return;
    this.promptHistoryIndex = Math.max(
      -1,
      Math.min(this.sessionPromptHistory.length - 1, this.promptHistoryIndex + dir)
    );
    if (this.promptHistoryIndex === -1) {
      this.inputEl.value = "";
    } else {
      this.inputEl.value = this.sessionPromptHistory[this.promptHistoryIndex];
    }
    // Move cursor to end
    this.inputEl.selectionStart = this.inputEl.selectionEnd = this.inputEl.value.length;
  }

  private async runCustomAction(customPrompt: string) {
    this.showLoading();
    const offsets = this.selOffsets;
    try {
      const intent = classifyResponseIntent(customPrompt, "");
      if (intent === "edit" && this.settings.enableStreaming && offsets) {
        // Streaming typewriter edit
        this.close();
        inlineDiffManager.onRetryCallback = () =>
          new (this.constructor as typeof InlineEditorModal)(
            this.app, this.editor, this.selectedText, this.aiClient,
            this.settings, this.sessionPromptHistory, this.onSaveLibrary
          ).open();
        const ok = await inlineDiffManager.applyDiffStreaming(
          this.editor, this.selectedText, offsets.from, offsets.to,
          (onChunk) => this.aiClient.runCustomStreaming(customPrompt, this.selectedText, onChunk)
        );
        if (!ok) {
          const resp = await this.aiClient.runCustom(customPrompt, this.selectedText);
          new DiffPreviewModal(this.app, this.editor, this.selectedText, resp.text, this.settings.diffViewMode).open();
        }
        return;
      }

      const resp = await this.aiClient.runCustom(customPrompt, this.selectedText);
      this.close();
      if (intent === "edit") {
        const applied = offsets
          ? inlineDiffManager.applyDiff(this.editor, this.selectedText, resp.text, offsets.from, offsets.to)
          : false;
        if (!applied) new DiffPreviewModal(this.app, this.editor, this.selectedText, resp.text, this.settings.diffViewMode).open();
      } else {
        new ReplyBubble(this.app, this.editor, resp.text, customPrompt).open();
      }
    } catch (err) {
      this.renderSendButton(this.contentEl.querySelector(".aic-modal-footer")!);
      new Notice(`❌ AI error: ${err instanceof Error ? err.message : String(err)}`, 6000);
    }
  }

  private async runAction(action: PromptAction, customPrompt: string) {
    const prompt = customPrompt.trim();
    if (action === "custom" && !prompt) {
      new Notice("Type a prompt or choose a quick action.");
      return;
    }

    // Record to session history
    if (action === "custom" && prompt && !this.sessionPromptHistory.includes(prompt)) {
      this.sessionPromptHistory.unshift(prompt);
      if (this.sessionPromptHistory.length > 20) this.sessionPromptHistory.length = 20;
    }

    // Determine intent upfront so we can start streaming immediately
    const intentKey = action === "custom" ? prompt : action;
    const intent = classifyResponseIntent(intentKey, "");
    const useStreaming = this.settings.enableStreaming && intent === "answer";

    this.showLoading();

    try {
      if (useStreaming) {
        // Open ReplyBubble immediately in streaming mode, stream into it
        this.close();
        const bubble = new ReplyBubble(this.app, this.editor, "", prompt || action);
        bubble.openStreaming();

        const ctx = action === "custom"
          ? { selectedText: this.selectedText, customInstruction: prompt }
          : { selectedText: this.selectedText };

        await this.aiClient.runStreaming(action, ctx, (chunk) => {
          bubble.appendChunk(chunk);
        });

        bubble.finalizeStreaming();
      } else {
        // Non-streaming full response
        const ctx = action === "custom"
          ? { selectedText: this.selectedText, customInstruction: prompt }
          : { selectedText: this.selectedText };

        const offsets = this.selOffsets;

        if (intent === "edit" && this.settings.enableStreaming && offsets) {
          // ── Streaming typewriter edit ─────────────────────────────────────
          this.close();
          // Wire retry so Retry button re-opens this exact modal
          inlineDiffManager.onRetryCallback = () =>
            new (this.constructor as typeof InlineEditorModal)(
              this.app, this.editor, this.selectedText, this.aiClient,
              this.settings, this.sessionPromptHistory, this.onSaveLibrary
            ).open();
          const streamCtx = action === "custom"
            ? { selectedText: this.selectedText, customInstruction: prompt }
            : { selectedText: this.selectedText };
          const ok = await inlineDiffManager.applyDiffStreaming(
            this.editor, this.selectedText, offsets.from, offsets.to,
            (onChunk) => this.aiClient.runStreaming(action, streamCtx, onChunk)
          );
          if (!ok) {
            const resp2 = await this.aiClient.run(action, streamCtx);
            new DiffPreviewModal(this.app, this.editor, this.selectedText, resp2.text, this.settings.diffViewMode).open();
          }
          return;
        }

        const resp = await this.aiClient.run(action, ctx);
        this.close();

        if (intent === "edit") {
          // Try inline diff first; fall back to popup if CM6 view unavailable
          const applied = offsets
            ? inlineDiffManager.applyDiff(this.editor, this.selectedText, resp.text, offsets.from, offsets.to)
            : false;
          if (!applied) {
            new DiffPreviewModal(this.app, this.editor, this.selectedText, resp.text, this.settings.diffViewMode).open();
          }
        } else {
          new ReplyBubble(this.app, this.editor, resp.text, prompt || action).open();
        }
      }
    } catch (err) {
      const footer = this.contentEl.querySelector(".aic-modal-footer");
      if (footer) this.renderSendButton(footer as HTMLElement);
      new Notice(`❌ AI error: ${err instanceof Error ? err.message : String(err)}`, 6000);
    }
  }

  private showLoading() {
    const footer = this.contentEl.querySelector(".aic-modal-footer");
    if (!footer) return;
    footer.empty();
    const loader = footer.createEl("div", { cls: "aic-loading" });
    loader.createEl("span", { cls: "aic-dot" });
    loader.createEl("span", { cls: "aic-dot" });
    loader.createEl("span", { cls: "aic-dot" });
    footer.createEl("span", { cls: "aic-loading-text", text: "Thinking…" });
  }

  onClose() {
    this.contentEl.empty();
  }
}
