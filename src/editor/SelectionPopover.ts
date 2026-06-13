// ─── Floating Selection Popover ──────────────────────────────────────────────
// A floating, Notion-like popover that appears near the text selection.
// It contains a text input for custom prompts and a list of quick actions.
// Supports keyboard navigation (ArrowUp/Down, Enter, Esc) and filters the action list as you type.

import { App, Editor, setIcon, Notice } from "obsidian";
import { EditorView } from "@codemirror/view";
import { EditorSelection } from "@codemirror/state";
import { inlineDiffManager, getSelectionOffsets } from "./InlineDiffManager";
import { inlineDiffField } from "./inlineDiffExtension";
import { DiffPreviewModal } from "../modals/DiffPreviewModal";
import { ReplyBubble } from "../modals/ReplyBubble";
import { PromptLibraryModal } from "../modals/PromptLibraryModal";
import type { AICompanionSettings, PromptLibraryItem, CustomQuickAction } from "../settings/settings";
import type { AIClient } from "../ai/AIClient";
import type { PromptAction } from "../ai/prompts";
import { classifyResponseIntent } from "../ai/prompts";

interface PopoverAction {
  id?: string;
  icon: string;
  label: string;
  action: PromptAction | "custom";
  customPrompt?: string;
  isLibraryPrompt?: boolean;
}

const BUILTIN_ACTIONS: PopoverAction[] = [];

export class SelectionPopover {
  private el: HTMLElement | null = null;
  private inputEl: HTMLTextAreaElement | null = null;
  private listEl: HTMLElement | null = null;
  private actionItems: { element: HTMLElement; action: PopoverAction }[] = [];
  private selectedIndex = -1; // -1 means focus in input, >=0 means active list item
  private promptHistoryIndex = -1;
  
  private clickOutsideHandler: (e: MouseEvent) => void;
  private escHandler: (e: KeyboardEvent) => void;
  private resizeHandler: () => void;

  constructor(
    private app: App,
    private editor: Editor,
    private view: EditorView,
    private selectedText: string,
    private aiClient: AIClient,
    private settings: AICompanionSettings,
    private sessionPromptHistory: string[],
    private onSaveLibrary: (lib: PromptLibraryItem[]) => Promise<void>
  ) {
    this.clickOutsideHandler = this.handleClickOutside.bind(this);
    this.escHandler = this.handleKeyDown.bind(this);
    this.resizeHandler = this.close.bind(this);
  }

  open() {
    // Prevent multiple popovers from being open
    this.closeExisting();

    const doc = this.view.dom.ownerDocument;
    const win = doc.defaultView || window;

    // 1. Create main container
    this.el = doc.createElement("div");
    this.el.className = "aic-popover";
    this.el.style.opacity = "0"; // Render invisibly first to measure height
    doc.body.appendChild(this.el);

    // 2. Render Header/Input container
    const inputContainer = this.el.createEl("div", { cls: "aic-popover-input-container" });
    
    this.inputEl = inputContainer.createEl("textarea", {
      cls: "aic-popover-input",
      attr: { 
        placeholder: "Ask AI to edit, write, explain...",
        rows: "1",
        tabindex: "0"
      }
    });

    const toolbar = inputContainer.createEl("div", { cls: "aic-popover-toolbar" });
    const libBtn = toolbar.createEl("button", { cls: "aic-popover-toolbar-btn", attr: { title: "Open Library" } });
    setIcon(libBtn.createEl("span"), "library");
    libBtn.createEl("span", { text: "Library" });
    
    libBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.openLibrary();
    });

    const saveBtn = toolbar.createEl("button", { cls: "aic-popover-toolbar-btn", attr: { title: "Save to Library" } });
    setIcon(saveBtn.createEl("span"), "bookmark-plus");
    saveBtn.createEl("span", { text: "Save" });

    saveBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const prompt = this.inputEl?.value.trim();
      if (!prompt) {
        new Notice("Type a prompt first to save it.");
        return;
      }
      this.close();
      const modal = new PromptLibraryModal(
        this.app,
        this.settings.promptLibrary,
        this.onSaveLibrary,
        "manage"
      );
      modal.open();
      new Notice("📚 Open a prompt in library, then paste your prompt there.");
    });

    if (this.sessionPromptHistory.length > 0) {
      toolbar.createEl("span", { cls: "aic-popover-history-hint", text: "↑↓ History" });
    }

    // 3. Render Actions List
    this.listEl = this.el.createEl("div", { cls: "aic-popover-list" });
    this.renderList();

    // 4. Attach Event Listeners
    doc.addEventListener("mousedown", this.clickOutsideHandler, true);
    doc.addEventListener("keydown", this.escHandler, true);
    win.addEventListener("resize", this.resizeHandler);

    this.inputEl.addEventListener("input", () => {
      this.adjustInputHeight();
      this.renderList();
    });

    this.inputEl.addEventListener("keydown", (e) => {
      this.handleInputKeydown(e);
    });

    // 5. Focus Input
    setTimeout(() => {
      if (this.inputEl) this.inputEl.focus();
    }, 50);

    // 6. Position Popover
    this.positionPopover();
  }

  private closeExisting() {
    const doc = this.view.dom.ownerDocument;
    const existing = doc.querySelectorAll(".aic-popover");
    existing.forEach((el) => el.remove());
  }

  private adjustInputHeight() {
    if (!this.inputEl) return;
    this.inputEl.style.height = "auto";
    this.inputEl.style.height = this.inputEl.scrollHeight + "px';";
    // Clean up potential invalid inline styles
    this.inputEl.style.height = `${this.inputEl.scrollHeight}px`;
  }

  private renderList() {
    if (!this.listEl || !this.inputEl) return;
    this.listEl.empty();
    this.actionItems = [];
    
    const query = this.inputEl.value.trim().toLowerCase();

    // Gather all actions (builtin + custom + pinned library)
    const allActions: PopoverAction[] = [
      ...BUILTIN_ACTIONS,
      ...this.settings.customQuickActions.map((cqa) => ({
        icon: cqa.icon || "zap",
        label: cqa.label,
        action: "custom" as PromptAction,
        customPrompt: cqa.prompt,
      })),
      ...this.settings.promptLibrary
        .filter((p) => p.showInQuickActions)
        .map((p) => ({
          id: p.id,
          icon: p.icon || "bookmark",
          label: p.name,
          action: "custom" as PromptAction,
          customPrompt: p.prompt,
          isLibraryPrompt: true,
        })),
    ];

    // If query is present, prepend "Ask AI: <query>"
    if (query.length > 0) {
      const askAction: PopoverAction = {
        icon: "sparkles",
        label: `Ask AI: "${this.inputEl.value.trim()}"`,
        action: "custom",
        customPrompt: this.inputEl.value.trim(),
      };
      
      const item = this.listEl.createEl("div", {
        cls: "aic-popover-item aic-popover-item-primary"
      });
      const iconSpan = item.createEl("span", { cls: "aic-popover-item-icon" });
      setIcon(iconSpan, askAction.icon);
      item.createEl("span", { text: askAction.label });

      item.addEventListener("click", () => this.executeAction(askAction));
      this.actionItems.push({ element: item, action: askAction });
    }

    // Filter and render other actions
    const filtered = allActions.filter(act => 
      act.label.toLowerCase().includes(query) || (act.customPrompt && act.customPrompt.toLowerCase().includes(query))
    );

    if (filtered.length > 0) {
      const groupTitle = this.listEl.createEl("div", { cls: "aic-popover-group-title", text: query.length > 0 ? "Suggested Actions" : "Quick Actions" });
      
      filtered.forEach((act) => {
        const item = this.listEl.createEl("div", {
          cls: "aic-popover-item"
        });



        const iconSpan = item.createEl("span", { cls: "aic-popover-item-icon" });
        setIcon(iconSpan, act.icon);
        item.createEl("span", { text: qaLabelWithQuery(act.label, query) });

        item.addEventListener("click", () => this.executeAction(act));
        this.actionItems.push({ element: item, action: act });
      });
    }

    // Reset selected index after filter changes
    this.selectedIndex = query.length > 0 ? 0 : -1;
    this.updateSelection();
  }

  private updateSelection() {
    this.actionItems.forEach((item, idx) => {
      if (idx === this.selectedIndex) {
        item.element.addClass("is-selected");
        item.element.scrollIntoView({ block: "nearest" });
      } else {
        item.element.removeClass("is-selected");
      }
    });
  }

  private handleInputKeydown(e: KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (this.actionItems.length > 0) {
        this.selectedIndex = (this.selectedIndex + 1) % this.actionItems.length;
        this.updateSelection();
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (this.actionItems.length > 0) {
        if (this.selectedIndex <= 0) {
          // If at top or input, navigate history or reset
          this.selectedIndex = -1;
          this.updateSelection();
          // Let standard history take over if they press Up in empty input
          if (this.inputEl && this.inputEl.value === "") {
            this.navigateHistory(1);
          }
        } else {
          this.selectedIndex--;
          this.updateSelection();
        }
      } else if (this.inputEl && this.inputEl.value === "") {
        this.navigateHistory(1);
      }
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (this.selectedIndex >= 0 && this.selectedIndex < this.actionItems.length) {
        this.executeAction(this.actionItems[this.selectedIndex].action);
      } else {
        const val = this.inputEl?.value.trim();
        if (val) {
          this.executeAction({
            icon: "sparkles",
            label: `Ask AI`,
            action: "custom",
            customPrompt: val
          });
        }
      }
    }
  }

  private navigateHistory(dir: 1 | -1) {
    if (!this.inputEl || this.sessionPromptHistory.length === 0) return;
    this.promptHistoryIndex = Math.max(
      -1,
      Math.min(this.sessionPromptHistory.length - 1, this.promptHistoryIndex + dir)
    );
    if (this.promptHistoryIndex === -1) {
      this.inputEl.value = "";
    } else {
      this.inputEl.value = this.sessionPromptHistory[this.promptHistoryIndex];
    }
    this.inputEl.selectionStart = this.inputEl.selectionEnd = this.inputEl.value.length;
    this.adjustInputHeight();
    this.renderList();
  }

  private positionPopover() {
    if (!this.el) return;

    const sel = this.view.state.selection.main;
    let coords = this.view.coordsAtPos(sel.to, 1);
    if (!coords) coords = this.view.coordsAtPos(sel.to, -1);
    if (!coords) coords = this.view.coordsAtPos(sel.from, 1);
    if (!coords) {
      this.close();
      return;
    }

    const doc = this.view.dom.ownerDocument;
    const win = doc.defaultView || window;

    const popoverWidth = 320;
    this.el.style.width = `${popoverWidth}px`;
    
    // Read offsetHeight from DOM (safely done here before display manipulation)
    const popoverHeight = this.el.offsetHeight;

    let left = coords.left;
    // Keep it within window bounds
    left = Math.min(Math.max(left, 16), win.innerWidth - popoverWidth - 16);

    let top = coords.bottom + 8;
    // If it overflows the bottom of the window, place it above the selection instead
    if (top + popoverHeight > win.innerHeight - 16) {
      top = coords.top - popoverHeight - 8;
    }
    top = Math.max(top, 16);

    this.el.style.left = `${left}px`;
    this.el.style.top = `${top}px`;
    this.el.style.opacity = "1"; // Fade in
  }

  private openLibrary() {
    this.close();
    new PromptLibraryModal(
      this.app,
      this.settings.promptLibrary,
      this.onSaveLibrary,
      "select",
      (item) => {
        this.executeAction({
          icon: item.icon || "bookmark",
          label: item.name,
          action: "custom",
          customPrompt: item.prompt
        });
      }
    ).open();
  }

  private async executeAction(act: PopoverAction) {
    const offsets = getSelectionOffsets(this.editor);
    const originalText = this.selectedText;
    const action = act.action;
    const prompt = act.customPrompt || "";

    // Save custom prompt to history if applicable
    if (action === "custom" && prompt && !this.sessionPromptHistory.includes(prompt)) {
      this.sessionPromptHistory.unshift(prompt);
      if (this.sessionPromptHistory.length > 20) this.sessionPromptHistory.length = 20;
    }

    const intentKey = action === "custom" ? prompt : action;
    const intent = classifyResponseIntent(intentKey, "");
    const useStreaming = this.settings.enableStreaming;

    this.close();

    // Show loading notice for non-streaming
    let loading: Notice | null = null;
    if (!useStreaming) {
      loading = new Notice(`⏳ Running AI action...`, 0);
    }

    try {
      if (intent === "edit" && useStreaming && offsets) {
        // Wire up retry for streaming
        inlineDiffManager.onRetryCallback = () => {
          const pop = new SelectionPopover(
            this.app, this.editor, this.view, originalText, this.aiClient,
            this.settings, this.sessionPromptHistory, this.onSaveLibrary
          );
          pop.open();
        };

        const streamCtx = action === "custom"
          ? { selectedText: originalText, customInstruction: prompt }
          : { selectedText: originalText };

        await inlineDiffManager.applyDiffStreaming(
          this.editor, originalText, offsets.from, offsets.to,
          (onChunk) => this.aiClient.runStreaming(action, streamCtx, onChunk)
        );
      } else if (intent === "edit") {
        // Non-streaming edit
        const ctx = action === "custom"
          ? { selectedText: originalText, customInstruction: prompt }
          : { selectedText: originalText };

        const resp = await this.aiClient.run(action, ctx);
        if (loading) loading.hide();

        const applied = offsets
          ? inlineDiffManager.applyDiff(this.editor, originalText, resp.text, offsets.from, offsets.to)
          : false;
        if (!applied) {
          new DiffPreviewModal(this.app, this.editor, originalText, resp.text, this.settings.diffViewMode).open();
        }
      } else {
        // Answer / Q&A
        if (useStreaming) {
          const bubble = new ReplyBubble(this.app, this.editor, "", prompt || (action as string));
          bubble.openStreaming();
          const streamCtx = action === "custom"
            ? { selectedText: originalText, customInstruction: prompt }
            : { selectedText: originalText };

          await this.aiClient.runStreaming(action, streamCtx, (chunk) => bubble.appendChunk(chunk));
          bubble.finalizeStreaming();
        } else {
          const ctx = action === "custom"
            ? { selectedText: originalText, customInstruction: prompt }
            : { selectedText: originalText };

          const resp = await this.aiClient.run(action, ctx);
          if (loading) loading.hide();
          new ReplyBubble(this.app, this.editor, resp.text, prompt || (action as string)).open();
        }
      }
    } catch (e) {
      if (loading) loading.hide();
      new Notice(`❌ AI Error: ${e instanceof Error ? e.message : String(e)}`, 6000);
    }
  }

  private handleClickOutside(e: MouseEvent) {
    if (this.el && !this.el.contains(e.target as Node)) {
      this.close();
    }
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      this.close();
    }
  }

  close() {
    const doc = this.view.dom.ownerDocument;
    const win = doc.defaultView || window;

    doc.removeEventListener("mousedown", this.clickOutsideHandler, true);
    doc.removeEventListener("keydown", this.escHandler, true);
    win.removeEventListener("resize", this.resizeHandler);

    if (this.el) {
      this.el.remove();
      this.el = null;
    }
  }
}

// Utility to cleanly represent action labels without HTML injection issues
function qaLabelWithQuery(label: string, query: string): string {
  return label; // Simplified, can highlight matches in future if needed
}
