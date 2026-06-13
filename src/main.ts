// ─── AI Companion — Main Plugin Entry Point (v2) ──────────────────────────────

import {
  Plugin,
  Notice,
  Editor,
  TFile,
} from "obsidian";

import { DEFAULT_SETTINGS, INITIAL_DEFAULT_PROMPTS } from "./settings/settings";
import type { AICompanionSettings, PromptLibraryItem } from "./settings/settings";
import { AICompanionSettingsTab } from "./settings/SettingsTab";
import { AIClient } from "./ai/AIClient";
import { InlineEditorModal } from "./modals/InlineEditorModal";
import { WelcomeModal } from "./modals/WelcomeModal";
import { DiffPreviewModal } from "./modals/DiffPreviewModal";
import { ReplyBubble } from "./modals/ReplyBubble";
import { PasteHandler } from "./automation/PasteHandler";
import { HistoryPanel, HISTORY_VIEW_TYPE } from "./sidebar/HistoryPanel";
import { getSelectionOrParagraph, getFullNote, insertBelow } from "./utils/textUtils";
import { inlineDiffExtension } from "./editor/inlineDiffExtension";
import { inlineDiffManager, getSelectionOffsets } from "./editor/InlineDiffManager";
import { selectionFloatButtonExtension, setFloatButtonClickHandler } from "./editor/SelectionFloatButton";
import { SelectionPopover } from "./editor/SelectionPopover";
import type { PromptAction } from "./ai/prompts";


export default class AICompanionPlugin extends Plugin {
  settings!: AICompanionSettings;
  aiClient!: AIClient;
  private pasteHandler!: PasteHandler;
  private ribbonIconEl: HTMLElement | null = null;

  /** Session-level prompt history (reused across modal opens) */
  public sessionPromptHistory: string[] = [];

  async onload() {
    await this.loadSettings();

    this.aiClient = new AIClient(this.settings);
    this.pasteHandler = new PasteHandler(
      this.app,
      this.aiClient,
      this.settings.diffViewMode,
      this.settings.autoSuggestMinChars
    );

    // Attach persistent history callback
    this.aiClient.onRequestEnd = async (entry) => {
      if (entry.provider !== "error") {
        await this.appendHistoryToVault(entry);
      }
    };

    // Load saved history from vault
    await this.loadHistoryFromVault();

    this.addSettingTab(new AICompanionSettingsTab(this.app, this));

    // ── CM6 editor extensions ───────────────────────────────────────────────
    this.registerEditorExtension(inlineDiffExtension);
    this.registerEditorExtension([selectionFloatButtonExtension]);

    // ── Floating selection button click → open inline editor ───────────────
    setFloatButtonClickHandler((view) => {
      const mdView = this.app.workspace.getActiveViewOfType(
        require("obsidian").MarkdownView
      );
      if (!mdView) return;
      const editor = mdView.editor;
      const sel = getSelectionOrParagraph(editor);
      if (!sel.text.trim()) return;
      new SelectionPopover(
        this.app, editor, view, sel.text, this.aiClient,
        this.settings, this.sessionPromptHistory, this.savePromptLibrary
      ).open();
    });

    // ── Right-click context menu ────────────────────────────────────────────
    this.registerEvent(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.app.workspace as any).on("editor-menu", (menu: any, editor: Editor) => {
        const sel = editor.getSelection();
        if (!sel || !sel.trim()) return;

        menu.addSeparator();

        // "Open popup" item
        menu.addItem((item: any) =>
          item.setTitle("✦ Edit with AI…")
              .setIcon("sparkles")
              .onClick(() => {
                const cm = (editor as any).cm;
                if (!cm) return;
                new SelectionPopover(
                  this.app, editor, cm, sel, this.aiClient,
                  this.settings, this.sessionPromptHistory, this.savePromptLibrary
                ).open();
              })
        );

        // Quick-fire actions (no popup, run inline directly)
        const quickActions: { title: string; action: PromptAction }[] = [
          { title: "Improve writing",  action: "improve"  },
          { title: "Fix grammar",      action: "grammar"  },
          { title: "Make concise",     action: "concise"  },
          { title: "Explain",          action: "explain"  },
          { title: "Translate…",       action: "translate" },
        ];

        quickActions.forEach(({ title, action }) => {
          menu.addItem((item: any) =>
            item.setTitle(title)
                .onClick(async () => {
                  const offsets = getSelectionOffsets(editor);
                  const loading = new Notice(`⏳ ${title}…`, 0);
                  try {
                    if (this.settings.enableStreaming && offsets) {
                      // Streaming inline diff directly from context menu
                      loading.hide();
                      await inlineDiffManager.applyDiffStreaming(
                        editor, sel, offsets.from, offsets.to,
                        (onChunk) => this.aiClient.runStreaming(action, { selectedText: sel }, onChunk)
                      );
                    } else {
                      const resp = await this.aiClient.run(action, { selectedText: sel });
                      loading.hide();
                      if (offsets) {
                        const applied = inlineDiffManager.applyDiff(
                          editor, sel, resp.text, offsets.from, offsets.to
                        );
                        if (!applied) {
                          new DiffPreviewModal(this.app, editor, sel, resp.text, this.settings.diffViewMode).open();
                        }
                      }
                    }
                  } catch (e) {
                    loading.hide();
                    new Notice(`❌ ${e instanceof Error ? e.message : e}`);
                  }
                })
          );
        });

        menu.addSeparator();
      })
    );

    // Sidebar panel
    this.registerView(HISTORY_VIEW_TYPE, (leaf) => new HistoryPanel(leaf, this.aiClient));

    // Ribbon icon
    this.updateRibbonIconVisibility();

    this.registerAllCommands();

    // Paste event
    this.registerEvent(
      this.app.workspace.on("editor-paste", (evt: ClipboardEvent, editor: Editor) => {
        if (!this.settings.autoSuggestOnPaste) return;
        const text = evt.clipboardData?.getData("text/plain") ?? "";
        if (text) this.pasteHandler.onPaste(text, editor);
      })
    );

    if (this.settings.slashCommandsEnabled) {
      this.registerSlashCommands();
    }

    // ── Welcome Modal Onboarding ────────────────────────────────────────────
    this.app.workspace.onLayoutReady(async () => {
      if (!this.settings.hasSeenWelcome) {
        new WelcomeModal(this.app).open();
        this.settings.hasSeenWelcome = true;
        await this.saveSettings();
      }
    });

    console.log("✦ AI Companion v2 loaded");
  }

  // ── Persistent History ─────────────────────────────────────────────────────

  private async loadHistoryFromVault() {
    try {
      const path = this.settings.historyFilePath;
      if (!(await this.app.vault.adapter.exists(path))) return;

      const raw = await this.app.vault.adapter.read(path);
      const parsed = JSON.parse(raw) as Array<{
        id: string; timestamp: string; provider: string; model: string;
        action: string; prompt: string; response: string; tokensUsed?: number;
      }>;

      // Restore, converting timestamp strings back to Date objects
      this.aiClient.history = parsed.map((e) => ({
        ...e,
        timestamp: new Date(e.timestamp),
      }));

      console.log(`[AI Companion] Loaded ${this.aiClient.history.length} history entries from vault.`);
    } catch (err) {
      console.warn("[AI Companion] Could not load history from vault:", err);
    }
  }

  private async appendHistoryToVault(entry: typeof this.aiClient.history[0]) {
    try {
      const path = this.settings.historyFilePath;

      // Ensure directory exists
      const dir = path.substring(0, path.lastIndexOf("/"));
      if (dir && !(await this.app.vault.adapter.exists(dir))) {
        await this.app.vault.adapter.mkdir(dir);
      }

      // Write full history (keep it bounded)
      const bounded = this.aiClient.history.slice(0, this.settings.maxHistoryEntries);
      await this.app.vault.adapter.write(path, JSON.stringify(bounded, null, 2));
    } catch (err) {
      console.warn("[AI Companion] Could not save history to vault:", err);
    }
  }

  // ── Save prompt library ────────────────────────────────────────────────────
  public savePromptLibrary = async (library: PromptLibraryItem[]) => {
    this.settings.promptLibrary = library;
    await this.saveSettings();
  };

  // ── Commands ───────────────────────────────────────────────────────────────

  private registerAllCommands() {
    // Primary: AI Inline Editor
    this.addCommand({
      id: "ai-inline-editor",
      name: "Edit selection with AI",
      hotkeys: [{ modifiers: ["Mod", "Shift"], key: "A" }],
      editorCallback: (editor: Editor) => {
        const sel = getSelectionOrParagraph(editor);
        if (!sel.text.trim()) { new Notice("Select some text first."); return; }
        const cm = (editor as any).cm;
        if (!cm) return;
        new SelectionPopover(
          this.app, editor, cm, sel.text, this.aiClient,
          this.settings, this.sessionPromptHistory, this.savePromptLibrary
        ).open();
      },
    });

    // AI Paste
    this.addCommand({
      id: "ai-paste",
      name: "AI Paste & Refactor",
      hotkeys: [{ modifiers: ["Mod", "Shift"], key: "V" }],
      editorCallback: (editor: Editor) => this.pasteHandler.onAIPaste(editor),
    });

    // Summarize note
    this.addCommand({
      id: "ai-summarize-note",
      name: "Summarize this note",
      editorCallback: async (editor: Editor) => {
        const text = getFullNote(editor);
        if (!text.trim()) { new Notice("Note is empty."); return; }
        const loading = new Notice("⏳ Summarizing…", 0);
        try {
          const resp = await this.aiClient.run("summarize_note", { fullNote: text });
          loading.hide();
          new ReplyBubble(this.app, editor, resp.text, "Summarize this note").open();
        } catch (e) { loading.hide(); new Notice(`❌ ${e instanceof Error ? e.message : e}`); }
      },
    });

    // Generate title
    this.addCommand({
      id: "ai-generate-title",
      name: "Generate title for this note",
      editorCallback: async (editor: Editor) => {
        const text = getFullNote(editor);
        const loading = new Notice("⏳ Generating title…", 0);
        try {
          const resp = await this.aiClient.run("generate_title", { fullNote: text });
          loading.hide();
          new ReplyBubble(this.app, editor, `**Suggested title:**\n\n${resp.text}`, "Generate title").open();
        } catch (e) { loading.hide(); new Notice(`❌ ${e instanceof Error ? e.message : e}`); }
      },
    });

    // Generate tags
    this.addCommand({
      id: "ai-generate-tags",
      name: "Generate tags for this note",
      editorCallback: async (editor: Editor) => {
        const text = getFullNote(editor);
        const loading = new Notice("⏳ Generating tags…", 0);
        try {
          const resp = await this.aiClient.run("generate_tags", { fullNote: text });
          loading.hide();
          const tags = resp.text.split(",").map((t) => `#${t.trim()}`).join(" ");
          new ReplyBubble(this.app, editor, `**Suggested tags:**\n\n${tags}`, "Generate tags").open();
        } catch (e) { loading.hide(); new Notice(`❌ ${e instanceof Error ? e.message : e}`); }
      },
    });

    // Continue writing
    this.addCommand({
      id: "ai-continue-writing",
      name: "Continue writing from cursor",
      editorCallback: async (editor: Editor) => {
        const cursor = editor.getCursor();
        const textSoFar = editor.getRange({ line: 0, ch: 0 }, cursor);
        if (!textSoFar.trim()) { new Notice("Nothing to continue from."); return; }
        const loading = new Notice("⏳ Continuing…", 0);
        try {
          const resp = await this.aiClient.run("continue_writing", { selectedText: textSoFar });
          loading.hide();
          insertBelow(editor, resp.text);
          new Notice("✅ Continuation inserted below.");
        } catch (e) { loading.hide(); new Notice(`❌ ${e instanceof Error ? e.message : e}`); }
      },
    });

    // Create outline
    this.addCommand({
      id: "ai-create-outline",
      name: "Create outline from selection or note",
      editorCallback: async (editor: Editor) => {
        const sel = getSelectionOrParagraph(editor);
        const text = sel.hasSelection ? sel.text : getFullNote(editor);
        const loading = new Notice("⏳ Creating outline…", 0);
        try {
          const resp = await this.aiClient.run("create_outline", { selectedText: text });
          loading.hide();
          new DiffPreviewModal(this.app, editor, text, resp.text, this.settings.diffViewMode).open();
        } catch (e) { loading.hide(); new Notice(`❌ ${e instanceof Error ? e.message : e}`); }
      },
    });

    // Explain code
    this.addCommand({
      id: "ai-explain-code",
      name: "Explain selected code block",
      editorCallback: async (editor: Editor) => {
        const sel = getSelectionOrParagraph(editor);
        if (!sel.text.trim()) { new Notice("Select a code block first."); return; }
        const loading = new Notice("⏳ Explaining code…", 0);
        try {
          const resp = await this.aiClient.run("explain_code", { selectedText: sel.text });
          loading.hide();
          new ReplyBubble(this.app, editor, resp.text, "Explain code block").open();
        } catch (e) { loading.hide(); new Notice(`❌ ${e instanceof Error ? e.message : e}`); }
      },
    });

    // Prompt library
    this.addCommand({
      id: "ai-prompt-library",
      name: "Open Prompt Library",
      callback: () => {
        const { PromptLibraryModal } = require("./modals/PromptLibraryModal");
        new PromptLibraryModal(
          this.app,
          this.settings.promptLibrary,
          this.savePromptLibrary,
          "manage"
        ).open();
      },
    });

    // Toggle history
    this.addCommand({
      id: "ai-toggle-history",
      name: "Toggle AI History panel",
      callback: () => this.activateHistoryPanel(),
    });
  }

  private registerSlashCommands() {
    this.registerEvent(
      this.app.workspace.on("editor-change", (editor: Editor) => {
        const cursor = editor.getCursor();
        const line = editor.getLine(cursor.line);
        const trimmed = line.trimStart();
        if (!trimmed.startsWith("/ai ") && trimmed !== "/ai") return;
        const cmd = trimmed.slice(4).trim().toLowerCase();
        this.handleSlashCommand(cmd, editor, cursor.line, line);
      })
    );
  }

  private async handleSlashCommand(cmd: string, editor: Editor, lineNum: number, fullLine: string) {
    const clearLine = () =>
      editor.replaceRange("", { line: lineNum, ch: 0 }, { line: lineNum, ch: fullLine.length });

    if (cmd === "" || cmd === "help") {
      clearLine();
      new Notice("AI slash commands:\n/ai improve\n/ai ask [?]\n/ai summary\n/ai translate\n/ai tags\n/ai outline", 8000);
      return;
    }

    if (cmd.startsWith("improve")) {
      clearLine();
      const sel = getSelectionOrParagraph(editor);
      new InlineEditorModal(this.app, editor, sel.text, this.aiClient, this.settings, this.sessionPromptHistory, this.savePromptLibrary).open();
    } else if (cmd.startsWith("ask")) {
      const question = cmd.slice(3).trim();
      if (!question) { new Notice("Usage: /ai ask [your question]"); return; }
      clearLine();
      const sel = getSelectionOrParagraph(editor);
      if (this.settings.enableStreaming) {
        const bubble = new ReplyBubble(this.app, editor, "", question);
        bubble.openStreaming();
        try {
          await this.aiClient.runCustomStreaming(question, sel.text, (chunk) => bubble.appendChunk(chunk));
          bubble.finalizeStreaming();
        } catch (e) { new Notice(`❌ ${e instanceof Error ? e.message : e}`); }
      } else {
        const loading = new Notice("⏳ Thinking…", 0);
        try {
          const resp = await this.aiClient.runCustom(question, sel.text);
          loading.hide();
          new ReplyBubble(this.app, editor, resp.text, question).open();
        } catch (e) { loading.hide(); new Notice(`❌ ${e instanceof Error ? e.message : e}`); }
      }
    } else if (cmd.startsWith("summary") || cmd.startsWith("summarize")) {
      clearLine();
      const text = getFullNote(editor);
      const loading = new Notice("⏳ Summarizing…", 0);
      try {
        const resp = await this.aiClient.run("summarize_note", { fullNote: text });
        loading.hide();
        new ReplyBubble(this.app, editor, resp.text, "summarize").open();
      } catch (e) { loading.hide(); new Notice(`❌ ${e instanceof Error ? e.message : e}`); }
    } else if (cmd.startsWith("translate")) {
      clearLine();
      const sel = getSelectionOrParagraph(editor);
      const lang = cmd.slice(9).trim() || "English";
      const loading = new Notice(`⏳ Translating to ${lang}…`, 0);
      try {
        const resp = await this.aiClient.run("translate", { selectedText: sel.text, targetLanguage: lang });
        loading.hide();
        new DiffPreviewModal(this.app, editor, sel.text, resp.text, this.settings.diffViewMode).open();
      } catch (e) { loading.hide(); new Notice(`❌ ${e instanceof Error ? e.message : e}`); }
    } else if (cmd.startsWith("tags")) {
      clearLine();
      const text = getFullNote(editor);
      const loading = new Notice("⏳ Generating tags…", 0);
      try {
        const resp = await this.aiClient.run("generate_tags", { fullNote: text });
        loading.hide();
        new ReplyBubble(this.app, editor, resp.text, "generate tags").open();
      } catch (e) { loading.hide(); new Notice(`❌ ${e instanceof Error ? e.message : e}`); }
    } else if (cmd.startsWith("outline")) {
      clearLine();
      const text = getFullNote(editor);
      const loading = new Notice("⏳ Creating outline…", 0);
      try {
        const resp = await this.aiClient.run("create_outline", { fullNote: text });
        loading.hide();
        new ReplyBubble(this.app, editor, resp.text, "create outline").open();
      } catch (e) { loading.hide(); new Notice(`❌ ${e instanceof Error ? e.message : e}`); }
    }
  }

  private async activateHistoryPanel() {
    const { workspace } = this.app;
    const existing = workspace.getLeavesOfType(HISTORY_VIEW_TYPE);
    if (existing.length > 0) {
      workspace.revealLeaf(existing[0]);
      (existing[0].view as HistoryPanel).render();
      return;
    }
    const leaf = workspace.getLeftLeaf(false);
    if (leaf) {
      await leaf.setViewState({ type: HISTORY_VIEW_TYPE, active: true });
      workspace.revealLeaf(leaf);
    }
  }

  public updateRibbonIconVisibility() {
    if (this.settings.showHistoryPanel) {
      if (!this.ribbonIconEl) {
        this.ribbonIconEl = this.addRibbonIcon("sparkles", "AI Companion", () => this.activateHistoryPanel());
      }
    } else {
      if (this.ribbonIconEl) {
        this.ribbonIconEl.remove();
        this.ribbonIconEl = null;
      }
    }
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    if (!this.settings.promptLibrary) {
      this.settings.promptLibrary = [];
    }
    // Ensure all default prompts exist in the library (by checking ID)
    let updated = false;
    for (const defPrompt of INITIAL_DEFAULT_PROMPTS) {
      if (!this.settings.promptLibrary.some((p) => p.id === defPrompt.id)) {
        this.settings.promptLibrary.push(JSON.parse(JSON.stringify(defPrompt)));
        updated = true;
      }
    }
    if (updated) {
      await this.saveSettings();
    }
  }

  async saveSettings() {
    await this.saveData(this.settings);
    this.aiClient.updateSettings(this.settings);
    this.pasteHandler.updateConfig(this.settings.diffViewMode, this.settings.autoSuggestMinChars);
  }

  onunload() {
    this.app.workspace.detachLeavesOfType(HISTORY_VIEW_TYPE);
  }
}
