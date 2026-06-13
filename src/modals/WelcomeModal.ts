// ─── Welcome Onboarding Modal ──────────────────────────────────────────────────
import { App, Modal, setIcon, Notice } from "obsidian";

export class WelcomeModal extends Modal {
  constructor(app: App) {
    super(app);
  }

  onOpen() {
    const { contentEl, modalEl } = this;
    modalEl.addClass("aic-modal", "aic-welcome-modal");

    contentEl.empty();

    // ── Header ───────────────────────────────────────────────────────────────
    const header = contentEl.createEl("div", { cls: "aic-modal-header" });
    const iconEl = header.createEl("span", { cls: "aic-modal-icon" });
    setIcon(iconEl, "sparkles");
    header.createEl("span", { cls: "aic-modal-title", text: "Welcome to AI Companion" });

    // ── Body / Content ────────────────────────────────────────────────────────
    const body = contentEl.createEl("div", { cls: "aic-welcome-body" });
    
    body.createEl("p", {
      cls: "aic-welcome-lead",
      text: "Thanks for installing AI Companion! Your new AI-powered writing assistant is ready to help you edit, rewrite, and analyze notes."
    });

    // Shortcuts Section
    const shortcutsSection = body.createEl("div", { cls: "aic-welcome-section" });
    shortcutsSection.createEl("h3", { text: "Keyboard Shortcuts" });
    
    const table = shortcutsSection.createEl("table", { cls: "aic-welcome-table" });
    const tbody = table.createEl("tbody");
    
    const addShortcutRow = (keys: string, desc: string) => {
      const row = tbody.createEl("tr");
      const kbdCell = row.createEl("td", { cls: "aic-welcome-kbd-cell" });
      keys.split("+").forEach((key, idx) => {
        if (idx > 0) kbdCell.createSpan({ text: " + " });
        kbdCell.createEl("kbd", { text: key });
      });
      row.createEl("td", { cls: "aic-welcome-desc-cell", text: desc });
    };

    const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
    const modKey = isMac ? "Cmd" : "Ctrl";

    addShortcutRow(`${modKey}+Shift+A`, "Edit selection or ask AI via floating popover");
    addShortcutRow(`${modKey}+Shift+V`, "AI Paste & Refactor (improve formatting of pasted text)");
    addShortcutRow("Enter", "Submit prompt inside AI modals");
    addShortcutRow("Esc", "Close floating AI popover or modals");

    // Documentation Info
    const docSection = body.createEl("div", { cls: "aic-welcome-section" });
    docSection.createEl("h3", { text: "Getting Started" });
    
    const list = docSection.createEl("ol", { cls: "aic-welcome-steps" });
    list.createEl("li", {
      text: "Head to Settings to add your API Key (Google Gemini is recommended and offers a free tier!)."
    });
    list.createEl("li", {
      text: "Select any text in your editor, and click the purple ✦ button or press Mod+Shift+A to edit."
    });

    const docLinkWrap = docSection.createEl("p", { cls: "aic-welcome-doc-link-wrap" });
    docLinkWrap.createEl("span", { text: "Read the full guide and tips at: " });
    docLinkWrap.createEl("a", {
      text: "our documentation site",
      attr: { href: "https://github.com/hajorda/obsidian-ai-companion", target: "_blank" }
    });

    // ── Footer / Actions ──────────────────────────────────────────────────────
    const footer = contentEl.createEl("div", { cls: "aic-modal-footer aic-welcome-footer" });
    
    const settingsBtn = footer.createEl("button", {
      cls: "aic-welcome-settings-btn",
      text: "🔑 Go to Settings"
    });
    settingsBtn.addEventListener("click", () => {
      this.close();
      try {
        (this.app as any).setting.open();
        (this.app as any).setting.openTabById("ai-companion");
      } catch (err) {
        new Notice("Could not open settings automatically. Please open settings manually.");
      }
    });

    const startBtn = footer.createEl("button", {
      cls: "aic-welcome-start-btn mod-cta",
      text: "Get Started"
    });
    startBtn.addEventListener("click", () => {
      this.close();
    });
  }

  onClose() {
    this.contentEl.empty();
  }
}
