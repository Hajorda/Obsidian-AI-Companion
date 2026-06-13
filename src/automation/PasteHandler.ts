// ─── Paste & Refactor Handler ─────────────────────────────────────────────────

import { Editor, Notice, App } from "obsidian";
import type { AIClient } from "../ai/AIClient";
import { DiffPreviewModal } from "../modals/DiffPreviewModal";
import type { DiffViewMode } from "../settings/settings";

export class PasteHandler {
  private app: App;
  private aiClient: AIClient;
  private diffViewMode: DiffViewMode;
  private minChars: number;

  // Debounce timer for the auto-suggest toast
  private toastTimer: ReturnType<typeof setTimeout> | null = null;
  // Reference to the active toast element
  private activeToast: HTMLElement | null = null;

  constructor(
    app: App,
    aiClient: AIClient,
    diffViewMode: DiffViewMode,
    minChars: number
  ) {
    this.app = app;
    this.aiClient = aiClient;
    this.diffViewMode = diffViewMode;
    this.minChars = minChars;
  }

  updateConfig(diffViewMode: DiffViewMode, minChars: number) {
    this.diffViewMode = diffViewMode;
    this.minChars = minChars;
  }

  /**
   * Called after a paste event. Shows a subtle AI-refactor toast
   * if the pasted content exceeds minChars.
   */
  onPaste(pastedText: string, editor: Editor) {
    if (pastedText.length < this.minChars) return;

    this.dismissToast();

    // Small delay so the text is committed to the editor first
    this.toastTimer = setTimeout(() => {
      this.showRefactorToast(pastedText, editor);
    }, 300);
  }

  /**
   * Directly invoked by the AI Paste shortcut (Cmd+Shift+V).
   * Reads clipboard, shows a quick-pick overlay.
   */
  async onAIPaste(editor: Editor) {
    let clipText: string;
    try {
      clipText = await navigator.clipboard.readText();
    } catch {
      new Notice("❌ Cannot read clipboard. Please allow clipboard access.");
      return;
    }

    if (!clipText.trim()) {
      new Notice("Clipboard is empty.");
      return;
    }

    this.showAIPasteOverlay(clipText, editor);
  }

  private showAIPasteOverlay(text: string, editor: Editor) {
    // Create overlay
    const overlay = document.body.createEl("div", { cls: "aic-paste-overlay" });

    const card = overlay.createEl("div", { cls: "aic-paste-card" });
    card.createEl("div", {
      cls: "aic-paste-title",
      text: "✦ AI Paste",
    });
    card.createEl("div", {
      cls: "aic-paste-preview",
      text: text.slice(0, 100) + (text.length > 100 ? "…" : ""),
    });

    const actions = card.createEl("div", { cls: "aic-paste-actions" });

    const options: Array<{ label: string; emoji: string; action: "none" | "refactor" | "summarize" | "list" }> = [
      { emoji: "📋", label: "Paste as-is", action: "none" },
      { emoji: "🔧", label: "Refactor", action: "refactor" },
      { emoji: "📖", label: "Summarize", action: "summarize" },
      { emoji: "📝", label: "Format as list", action: "list" },
    ];

    for (const opt of options) {
      const btn = actions.createEl("button", { cls: "aic-paste-btn" });
      btn.createEl("span", { text: opt.emoji });
      btn.createEl("span", { text: opt.label });
      btn.addEventListener("click", async () => {
        overlay.remove();
        await this.handlePasteAction(text, opt.action, editor);
      });
    }

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.remove();
    });
  }

  private async handlePasteAction(
    text: string,
    action: "none" | "refactor" | "summarize" | "list",
    editor: Editor
  ) {
    if (action === "none") {
      const cursor = editor.getCursor();
      editor.replaceRange(text, cursor);
      return;
    }

    const promptMap = {
      refactor: "refactor_paste" as const,
      summarize: "summarize_note" as const,
      list: "custom" as const,
    };

    const aiAction = promptMap[action];
    const ctx =
      action === "list"
        ? { selectedText: text, customInstruction: "Format this as a clean markdown bullet list:" }
        : { selectedText: text };

    const loading = new Notice("⏳ Processing with AI…", 0);
    try {
      const resp = await this.aiClient.run(aiAction, ctx);
      loading.hide();

      // Insert at cursor, then show diff
      const cursor = editor.getCursor();
      editor.replaceRange(text, cursor); // First insert original
      const newCursor = editor.getCursor();
      const from = cursor;
      const to = newCursor;

      // Show diff modal so user can accept/reject
      editor.setSelection(from, to);
      new DiffPreviewModal(this.app, editor, text, resp.text, this.diffViewMode).open();
    } catch (err) {
      loading.hide();
      new Notice(`❌ AI error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  private showRefactorToast(text: string, editor: Editor) {
    this.dismissToast();

    const toast = document.body.createEl("div", { cls: "aic-toast" });
    toast.createEl("span", { cls: "aic-toast-icon", text: "✦" });
    toast.createEl("span", { text: "Refactor with AI?" });

    const yesBtn = toast.createEl("button", {
      cls: "aic-toast-btn aic-toast-yes",
      text: "Refactor",
    });
    const noBtn = toast.createEl("button", {
      cls: "aic-toast-btn aic-toast-no",
      text: "Dismiss",
    });

    yesBtn.addEventListener("click", async () => {
      toast.remove();
      this.activeToast = null;
      const loading = new Notice("⏳ Refactoring…", 0);
      try {
        const resp = await this.aiClient.run("refactor_paste", { selectedText: text });
        loading.hide();
        // Select the just-pasted text range for the diff
        new DiffPreviewModal(this.app, editor, text, resp.text, this.diffViewMode).open();
      } catch (err) {
        loading.hide();
        new Notice(`❌ AI error: ${err instanceof Error ? err.message : String(err)}`);
      }
    });

    noBtn.addEventListener("click", () => {
      toast.remove();
      this.activeToast = null;
    });

    this.activeToast = toast;

    // Auto-dismiss after 8 seconds
    setTimeout(() => {
      if (toast.isConnected) toast.remove();
      this.activeToast = null;
    }, 8000);
  }

  private dismissToast() {
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
      this.toastTimer = null;
    }
    if (this.activeToast) {
      this.activeToast.remove();
      this.activeToast = null;
    }
  }
}
