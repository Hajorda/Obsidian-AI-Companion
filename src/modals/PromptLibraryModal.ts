// ─── Prompt Library Modal ─────────────────────────────────────────────────────

import { App, Modal, setIcon, Notice } from "obsidian";
import type { PromptLibraryItem } from "../settings/settings";

export type LibraryMode = "select" | "manage";

export class PromptLibraryModal extends Modal {
  private library: PromptLibraryItem[];
  private onSelect?: (item: PromptLibraryItem) => void;
  private onSave: (library: PromptLibraryItem[]) => Promise<void>;
  private mode: LibraryMode;
  private searchQuery = "";
  private editingId: string | null = null;

  constructor(
    app: App,
    library: PromptLibraryItem[],
    onSave: (library: PromptLibraryItem[]) => Promise<void>,
    mode: LibraryMode = "select",
    onSelect?: (item: PromptLibraryItem) => void
  ) {
    super(app);
    // Work on a deep copy so cancel doesn't mutate settings
    this.library = library.map((i) => ({ ...i }));
    this.onSave = onSave;
    this.mode = mode;
    this.onSelect = onSelect;
  }

  onOpen() {
    const { modalEl, contentEl } = this;
    modalEl.addClass("aic-modal", "aic-library-modal");
    this.render(contentEl);
  }

  private render(contentEl: HTMLElement) {
    contentEl.empty();

    // ── Header ───────────────────────────────────────────────────────────────
    const header = contentEl.createEl("div", { cls: "aic-modal-header" });
    const iconEl = header.createEl("span", { cls: "aic-modal-icon" });
    setIcon(iconEl, "library");
    header.createEl("span", { cls: "aic-modal-title", text: "Prompt Library" });

    const addBtn = header.createEl("button", { cls: "aic-lib-add-btn", attr: { title: "Add new prompt" } });
    setIcon(addBtn, "plus");
    addBtn.addEventListener("click", () => {
      this.editingId = "__new__";
      this.render(contentEl);
    });

    // ── Search ────────────────────────────────────────────────────────────────
    const searchWrap = contentEl.createEl("div", { cls: "aic-lib-search-wrap" });
    const searchIcon = searchWrap.createEl("span", { cls: "aic-lib-search-icon" });
    setIcon(searchIcon, "search");
    const searchInput = searchWrap.createEl("input", {
      cls: "aic-lib-search",
      attr: { placeholder: "Search prompts…", type: "text", value: this.searchQuery },
    });
    searchInput.addEventListener("input", () => {
      this.searchQuery = searchInput.value;
      this.render(contentEl);
    });
    setTimeout(() => {
      if (this.editingId === null) {
        searchInput.focus();
      }
    }, 50);

    // ── Add / Edit form ───────────────────────────────────────────────────────
    if (this.editingId !== null) {
      this.renderEditForm(contentEl);
      return;
    }

    // ── Prompt list ───────────────────────────────────────────────────────────
    const list = contentEl.createEl("div", { cls: "aic-lib-list" });
    const filtered = this.library.filter(
      (p) =>
        !this.searchQuery ||
        p.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        p.prompt.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(this.searchQuery.toLowerCase())
    );

    if (filtered.length === 0) {
      const empty = list.createEl("div", { cls: "aic-lib-empty" });
      const emptyIcon = empty.createEl("div", { cls: "aic-lib-empty-icon" });
      setIcon(emptyIcon, "library");
      empty.createEl("p", { text: this.library.length === 0 ? "No saved prompts yet." : "No matches found." });
      if (this.library.length === 0) {
        empty.createEl("p", {
          text: 'Click + to add your first prompt.',
          cls: "aic-lib-empty-hint",
        });
      }
    }

    // Group by category
    const categories = [...new Set(filtered.map((p) => p.category || "General"))];
    for (const cat of categories) {
      const catItems = filtered.filter((p) => (p.category || "General") === cat);
      if (catItems.length === 0) continue;

      list.createEl("div", { cls: "aic-lib-category", text: cat });

      for (const item of catItems) {
        const row = list.createEl("div", { cls: "aic-lib-item" });
        row.setAttribute("draggable", "true");
        row.setAttribute("data-id", item.id);

        // Drag events for reordering
        row.addEventListener("dragstart", (e) => {
          e.dataTransfer?.setData("text/plain", item.id);
          row.addClass("is-dragging");
        });

        row.addEventListener("dragend", () => {
          row.removeClass("is-dragging");
        });

        row.addEventListener("dragover", (e) => {
          e.preventDefault();
          const draggingEl = list.querySelector(".is-dragging");
          if (draggingEl && draggingEl !== row) {
            const rect = row.getBoundingClientRect();
            const midpoint = rect.top + rect.height / 2;
            if (e.clientY < midpoint) {
              list.insertBefore(draggingEl, row);
            } else {
              list.insertAfter(draggingEl, row);
            }
          }
        });

        row.addEventListener("drop", (e) => {
          e.preventDefault();
          const draggedId = e.dataTransfer?.getData("text/plain");
          if (!draggedId) return;

          // Reorder list array based on new DOM order and dynamically update categories
          const newLibrary: PromptLibraryItem[] = [];
          let currentCategory = "General";
          
          Array.from(list.children).forEach((child) => {
            if (child.classList.contains("aic-lib-category")) {
              currentCategory = child.textContent || "General";
            } else if (child.classList.contains("aic-lib-item")) {
              const id = child.getAttribute("data-id");
              const found = this.library.find((p) => p.id === id);
              if (found) {
                found.category = currentCategory;
                newLibrary.push(found);
              }
            }
          });
          
          this.library = newLibrary;
          this.onSave(this.library);
          this.render(contentEl);
        });

        // Drag handle
        const dragHandle = row.createEl("div", { cls: "aic-lib-drag-handle", attr: { title: "Drag to reorder" } });
        setIcon(dragHandle, "grip-vertical");

        // Custom or default icon
        const iconContainer = row.createEl("div", { cls: "aic-lib-item-icon" });
        setIcon(iconContainer, item.icon || "bookmark");

        const info = row.createEl("div", { cls: "aic-lib-item-info" });
        info.createEl("div", { cls: "aic-lib-item-name", text: item.name });
        info.createEl("div", {
          cls: "aic-lib-item-preview",
          text: item.prompt.slice(0, 80) + (item.prompt.length > 80 ? "…" : ""),
        });

        const actions = row.createEl("div", { cls: "aic-lib-item-actions" });

        if (this.mode === "select") {
          const useBtn = actions.createEl("button", { cls: "aic-lib-use-btn mod-cta", text: "Use" });
          useBtn.addEventListener("click", () => {
            this.onSelect?.(item);
            this.close();
          });
        }

        // Pin/unpin to Quick Actions
        const pinBtn = actions.createEl("button", { 
          cls: "aic-lib-icon-btn aic-lib-pin-btn" + (item.showInQuickActions ? " is-active" : ""), 
          attr: { title: item.showInQuickActions ? "Remove from Quick Actions" : "Show in Quick Actions" } 
        });
        setIcon(pinBtn, item.showInQuickActions ? "pin-off" : "pin");
        pinBtn.addEventListener("click", async (e) => {
          e.stopPropagation();
          item.showInQuickActions = !item.showInQuickActions;
          const idx = this.library.findIndex((p) => p.id === item.id);
          if (idx !== -1) {
            this.library[idx].showInQuickActions = item.showInQuickActions;
          }
          await this.onSave(this.library);
          this.render(contentEl);
        });

        const editBtn = actions.createEl("button", { cls: "aic-lib-icon-btn", attr: { title: "Edit" } });
        setIcon(editBtn, "pencil");
        editBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          this.editingId = item.id;
          this.render(contentEl);
        });

        const delBtn = actions.createEl("button", { cls: "aic-lib-icon-btn aic-lib-del-btn", attr: { title: "Delete" } });
        setIcon(delBtn, "trash-2");
        delBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          this.library = this.library.filter((p) => p.id !== item.id);
          this.onSave(this.library);
          this.render(contentEl);
        });

        if (this.mode === "select") {
          row.addEventListener("click", () => {
            this.onSelect?.(item);
            this.close();
          });
          row.style.cursor = "pointer";
        }
      }
    }
  }

  private renderEditForm(contentEl: HTMLElement) {
    const isNew = this.editingId === "__new__";
    const existing = isNew ? null : this.library.find((p) => p.id === this.editingId);

    const form = contentEl.createEl("div", { cls: "aic-lib-form" });
    form.createEl("div", { cls: "aic-lib-form-title", text: isNew ? "New Prompt" : "Edit Prompt" });

    // Name
    const nameWrap = form.createEl("div", { cls: "aic-lib-field" });
    nameWrap.createEl("label", { text: "Name", cls: "aic-lib-label" });
    const nameInput = nameWrap.createEl("input", {
      cls: "aic-lib-input",
      attr: { type: "text", placeholder: "e.g. Fix grammar", value: existing?.name ?? "" },
    });

    // Category
    const catWrap = form.createEl("div", { cls: "aic-lib-field" });
    catWrap.createEl("label", { text: "Category", cls: "aic-lib-label" });
    const catInput = catWrap.createEl("input", {
      cls: "aic-lib-input",
      attr: { type: "text", placeholder: "e.g. Editing, Writing, Research…", value: existing?.category ?? "" },
    });

    // Show in Quick Actions Toggle
    const pinWrap = form.createEl("div", { cls: "aic-lib-field aic-lib-field-toggle" });
    const pinLabel = pinWrap.createEl("label", { text: "Show as Quick Action Button", cls: "aic-lib-label" });
    const pinCheckbox = pinWrap.createEl("input", {
      cls: "aic-lib-checkbox",
      attr: { type: "checkbox" }
    });
    pinCheckbox.checked = existing?.showInQuickActions ?? false;

    // Icon Name & Live Preview
    const iconWrap = form.createEl("div", { cls: "aic-lib-field" });
    iconWrap.createEl("label", { text: "Icon Name (Lucide)", cls: "aic-lib-label" });
    const iconRow = iconWrap.createEl("div", { cls: "aic-lib-icon-picker-row" });
    const iconInput = iconRow.createEl("input", {
      cls: "aic-lib-input aic-lib-icon-input",
      attr: { type: "text", placeholder: "e.g. star, zap, heart, book-open", value: existing?.icon ?? "" }
    });
    const iconPreview = iconRow.createEl("div", { cls: "aic-lib-icon-preview" });
    
    const updatePreview = () => {
      iconPreview.empty();
      const iconName = iconInput.value.trim();
      if (iconName) {
        setIcon(iconPreview, iconName);
      } else {
        setIcon(iconPreview, "bookmark"); // Fallback
      }
    };
    iconInput.addEventListener("input", updatePreview);
    updatePreview();

    // Prompt
    const promptWrap = form.createEl("div", { cls: "aic-lib-field" });
    promptWrap.createEl("label", { text: "Prompt", cls: "aic-lib-label" });
    const promptInput = promptWrap.createEl("textarea", {
      cls: "aic-lib-textarea",
      attr: { placeholder: "Write your reusable prompt here…", rows: "5" },
    });
    promptInput.value = existing?.prompt ?? "";

    // Buttons
    const btnRow = form.createEl("div", { cls: "aic-lib-form-btns" });

    const cancelBtn = btnRow.createEl("button", { cls: "aic-lib-cancel-btn", text: "Cancel" });
    cancelBtn.addEventListener("click", () => {
      this.editingId = null;
      this.render(contentEl);
    });

    const saveBtn = btnRow.createEl("button", { cls: "aic-lib-save-btn mod-cta", text: "Save" });
    saveBtn.addEventListener("click", async () => {
      const name = nameInput.value.trim();
      const prompt = promptInput.value.trim();
      if (!name || !prompt) {
        new Notice("Name and Prompt are required.");
        return;
      }

      if (isNew) {
        this.library.push({
          id: crypto.randomUUID(),
          name,
          prompt,
          category: catInput.value.trim() || "General",
          showInQuickActions: pinCheckbox.checked,
          icon: iconInput.value.trim() || undefined,
        });
      } else {
        const idx = this.library.findIndex((p) => p.id === this.editingId);
        if (idx !== -1) {
          this.library[idx] = {
            id: this.editingId!,
            name,
            prompt,
            category: catInput.value.trim() || "General",
            showInQuickActions: pinCheckbox.checked,
            icon: iconInput.value.trim() || undefined,
          };
        }
      }

      await this.onSave(this.library);
      new Notice(`✅ Prompt "${name}" saved.`);
      this.editingId = null;
      this.render(contentEl);
    });

    setTimeout(() => nameInput.focus(), 50);
  }

  onClose() {
    this.contentEl.empty();
  }
}
