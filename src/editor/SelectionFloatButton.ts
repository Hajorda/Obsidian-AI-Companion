// ─── Floating Selection Button ────────────────────────────────────────────────
// A tiny ✦ button that appears near the text cursor whenever the user
// has text selected — like Notion's AI button. Click → opens AI popup.
// Implemented as a CM6 ViewPlugin so it tracks every selection change.

import { ViewPlugin, EditorView, ViewUpdate } from "@codemirror/view";
import { inlineDiffField } from "./inlineDiffExtension";

// ── Click callback — wired from main.ts ──────────────────────────────────────
type FloatClickFn = (view: EditorView) => void;
let _onClick: FloatClickFn | null = null;
export function setFloatButtonClickHandler(fn: FloatClickFn) { _onClick = fn; }

// ── ViewPlugin class ──────────────────────────────────────────────────────────
class FloatButtonPlugin {
  private el: HTMLElement;
  private scrollListener: () => void;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private view: EditorView) {
    console.log("[AI Companion] FloatButtonPlugin instantiated for view:", view);
    const doc = view.dom.ownerDocument;
    // Build the button DOM — appended to body of correct window for proper fixed positioning
    this.el = doc.createElement("button");
    this.el.className = "aic-float-btn";
    this.el.setAttribute("aria-label", "Edit with AI");
    this.el.setAttribute("title", "Edit with AI  (⌘⇧A)");
    this.el.innerHTML = `
      <span class="aic-float-btn-icon">✦</span>
      <span class="aic-float-btn-label">Ask AI</span>
    `;
    this.el.style.display = "none";
    doc.body.appendChild(this.el);

    // Prevent the mousedown from clearing the editor selection
    this.el.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
      _onClick?.(this.view);
    });

    // Re-position on editor scroll with immediately hiding
    this.scrollListener = () => {
      this.hide();
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }
      this.debounceTimer = setTimeout(() => this.reposition(), 150);
    };
    view.scrollDOM.addEventListener("scroll", this.scrollListener, { passive: true });
  }

  update(update: ViewUpdate) {
    const selectionChanged = update.selectionSet;
    const scrollChanged = update.viewportChanged || update.geometryChanged;
    const focusChanged = update.focusChanged;

    if (selectionChanged || scrollChanged || focusChanged) {
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = null;
      }

      // Hide immediately if selection is empty or diff is active
      const sel = update.state.selection.main;
      const diffActive = !!update.state.field(inlineDiffField, false);
      if (sel.empty || diffActive) {
        this.hide();
        return;
      }

      // Hide immediately on scroll/focus change so it doesn't float weirdly
      if (scrollChanged || focusChanged) {
        this.hide();
      }

      // Debounce showing/repositioning the button by 150ms
      this.debounceTimer = setTimeout(() => {
        this.reposition();
      }, 150);
    }
  }

  private reposition() {
    const sel = this.view.state.selection.main;

    // Hide if no selection, or if inline diff is active
    const diffActive = !!this.view.state.field(inlineDiffField, false);
    if (sel.empty || diffActive) {
      this.hide();
      return;
    }

    // Determine window, document, and app context for multi-window support
    const doc = this.view.dom.ownerDocument;
    const win = doc.defaultView || window;
    const app = (win as any).app;

    // 1. Hide if a modal dialog is open (like the Inline Editor popup)
    if (doc.querySelector(".modal-container")) {
      this.hide();
      return;
    }

    // 2. Hide if the floating button setting is disabled
    const pluginSettings = app?.plugins?.plugins?.["ai-companion"]?.settings;
    if (pluginSettings && !pluginSettings.showFloatingButton) {
      this.hide();
      return;
    }

    // Robust focus check: CodeMirror focus OR active MarkdownView editor match.
    // This handles temporary focus loss during drag-selection mouseup cycles.
    let isActiveEditor = false;
    try {
      const activeView = app?.workspace?.getActiveViewOfType(
        require("obsidian").MarkdownView
      );
      isActiveEditor = activeView && (activeView.editor as any)?.cm === this.view;
    } catch (e) {
      // Fallback if require("obsidian") is not loaded or fails
    }

    const hasFocus = this.view.hasFocus || isActiveEditor;
    console.log("[AI Companion] FloatButton reposition check:", {
      selectionEmpty: sel.empty,
      diffActive,
      editorHasFocus: this.view.hasFocus,
      isActiveEditor,
      hasFocus
    });

    if (!hasFocus) {
      this.hide();
      return;
    }

    // Measure layout and update position asynchronously to prevent layout thrashing
    // and solve CodeMirror 6 "Reading the editor layout isn't allowed during an update" error.
    this.view.requestMeasure({
      key: this,
      read: (view) => {
        const currentSel = view.state.selection.main;
        if (currentSel.empty) return null;

        let coords = view.coordsAtPos(currentSel.to, 1);
        if (!coords) {
          coords = view.coordsAtPos(currentSel.to, -1);
        }
        if (!coords) {
          coords = view.coordsAtPos(currentSel.from, 1);
        }
        return coords;
      },
      write: (coords, view) => {
        if (!coords) {
          console.log("[AI Companion] FloatButton hiding: coordsAtPos returned null");
          this.hide();
          return;
        }

        // Position calculation & clamping to viewport
        const btnW = 90;
        const left = Math.min(Math.max(coords.right, 8), win.innerWidth - btnW - 8);
        const top  = coords.bottom + 8;

        // Hide if button is above or below viewport
        if (top > win.innerHeight - 50 || top < 0) {
          console.log("[AI Companion] FloatButton hiding: vertical position out of viewport bounds", { top, winHeight: win.innerHeight });
          this.hide();
          return;
        }

        console.log("[AI Companion] Showing FloatButton at:", { left, top });
        this.el.style.display = "flex";
        this.el.style.left    = left + "px";
        this.el.style.top     = top  + "px";
      }
    });
  }

  private hide() {
    this.el.style.display = "none";
  }

  destroy() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.view.scrollDOM.removeEventListener("scroll", this.scrollListener);
    this.el.remove();
  }
}

export const selectionFloatButtonExtension = ViewPlugin.fromClass(FloatButtonPlugin);


