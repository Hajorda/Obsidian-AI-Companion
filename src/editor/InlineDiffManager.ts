// ─── Inline Diff Manager ─────────────────────────────────────────────────────
// Handles both instant and streaming inline diffs in the CM6 editor.
// "Instant" flow:  AI returns full text → replace selection → show decorations
// "Streaming" flow: AI streams tokens → typewriter into editor → show decorations

import { Editor } from "obsidian";
import { EditorView } from "@codemirror/view";
import { EditorSelection } from "@codemirror/state";
import {
  setInlineDiff,
  clearInlineDiff,
  toggleInlineDiffView,
  setInlineDiffCallbacks,
  clearInlineDiffCallbacks,
  type DiffChunk,
  type InlineDiffState,
} from "./inlineDiffExtension";

// ── Word count ────────────────────────────────────────────────────────────────
function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// ── Diff computation via diff-match-patch ─────────────────────────────────────
const DIFF_EQUAL  =  0;
const DIFF_INSERT =  1;
const DIFF_DELETE = -1;

function computeChunks(original: string, ai: string): DiffChunk[] {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const DMP = require("diff-match-patch");
  const dmp = new DMP.diff_match_patch();
  const diffs: Array<[number, string]> = dmp.diff_main(original, ai);
  dmp.diff_cleanupSemantic(diffs);
  return diffs.map(([op, text]: [number, string]): DiffChunk => {
    if (op === DIFF_EQUAL)  return { op: "equal",  text };
    if (op === DIFF_INSERT) return { op: "insert", text };
    return                         { op: "delete", text };
  });
}

// ── Get the underlying CM6 EditorView from an Obsidian Editor ────────────────
function getCmView(editor: Editor): EditorView | null {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cm = (editor as any).cm as EditorView | undefined;
  return cm instanceof EditorView ? cm : null;
}

// ── Activate decorations (shared between instant + streaming) ─────────────────
function activate(
  cm: EditorView,
  originalText: string,
  aiText: string,
  from: number,
  manager: InlineDiffManager
) {
  const chunks   = computeChunks(originalText, aiText);
  const wDelta   = wordCount(aiText) - wordCount(originalText);

  const state: InlineDiffState = {
    originalText,
    from,
    to: from + aiText.length,
    chunks,
    showDiff: true,
    wordDelta: wDelta,
  };

  setInlineDiffCallbacks({
    onAccept: () => manager.accept(),
    onReject: () => manager.reject(),
    onToggle: () => manager.toggleView(),
    onRetry:  () => manager.retry(),
  });

  cm.dispatch({ effects: setInlineDiff.of(state) });
  cm.dispatch({ effects: EditorView.scrollIntoView(from, { y: "nearest" }) });
}

// ── Manager ───────────────────────────────────────────────────────────────────
export class InlineDiffManager {
  private activeView:   EditorView | null = null;
  private activeEditor: Editor     | null = null;
  private originalText = "";
  private from = 0;
  private to   = 0;

  /** Callback set by the caller to re-open the AI popup (for Retry) */
  public onRetryCallback: (() => void) | null = null;

  // ── Instant diff (full response already available) ────────────────────────
  applyDiff(
    editor: Editor,
    originalText: string,
    aiText: string,
    selFrom: number,
    selTo: number
  ): boolean {
    const cm = getCmView(editor);
    if (!cm) {
      console.warn("[AI Companion] getCmView failed — fallback to popup");
      return false;
    }

    this.activeView   = cm;
    this.activeEditor = editor;
    this.originalText = originalText;
    this.from         = selFrom;
    this.to           = selFrom + aiText.length;

    // Replace selection with AI text and CLEAR the selection highlight
    cm.dispatch({
      changes: { from: selFrom, to: selTo, insert: aiText },
      selection: EditorSelection.cursor(selFrom),   // ← fixes the "still selected" bug
    });

    activate(cm, originalText, aiText, selFrom, this);
    return true;
  }

  // ── Streaming diff (typewriter effect, then decorations) ──────────────────
  async applyDiffStreaming(
    editor: Editor,
    originalText: string,
    selFrom: number,
    selTo: number,
    streamFn: (onChunk: (chunk: string) => void) => Promise<void>
  ): Promise<boolean> {
    const cm = getCmView(editor);
    if (!cm) return false;

    this.activeView   = cm;
    this.activeEditor = editor;
    this.originalText = originalText;
    this.from         = selFrom;

    // 1. Erase the selection so typewriter starts from a clean position
    cm.dispatch({
      changes: { from: selFrom, to: selTo, insert: "" },
      selection: EditorSelection.cursor(selFrom),
    });

    let currentPos  = selFrom;
    let accumulated = "";

    // 2. Stream each chunk directly into the document
    try {
      await streamFn((chunk: string) => {
        cm.dispatch({
          changes: { from: currentPos, to: currentPos, insert: chunk },
        });
        currentPos  += chunk.length;
        accumulated += chunk;
      });
    } catch (err) {
      // On streaming error: restore the original text
      cm.dispatch({
        changes:   { from: selFrom, to: currentPos, insert: originalText },
        selection: EditorSelection.cursor(selFrom),
      });
      this.reset();
      return false;
    }

    this.to = currentPos;

    // 3. Apply diff decorations now that full text is in the document
    activate(cm, originalText, accumulated, selFrom, this);
    return true;
  }

  // ── Accept ────────────────────────────────────────────────────────────────
  accept() {
    if (!this.activeView) return;
    this.activeView.dispatch({ effects: clearInlineDiff.of(null) });
    clearInlineDiffCallbacks();
    this.reset();
  }

  // ── Reject ────────────────────────────────────────────────────────────────
  reject() {
    if (!this.activeView) return;
    this.activeView.dispatch({
      changes:   { from: this.from, to: this.to, insert: this.originalText },
      selection: EditorSelection.cursor(this.from),
      effects:   clearInlineDiff.of(null),
    });
    clearInlineDiffCallbacks();
    this.reset();
  }

  // ── Retry (reject + re-open popup) ────────────────────────────────────────
  retry() {
    this.reject();                         // restores original text
    this.onRetryCallback?.();              // re-opens the AI modal
    this.onRetryCallback = null;
  }

  // ── Toggle diff / plain view ──────────────────────────────────────────────
  toggleView() {
    this.activeView?.dispatch({ effects: toggleInlineDiffView.of(null) });
  }

  isActive() { return !!this.activeView; }

  forceReject() { this.reject(); }

  private reset() {
    this.activeView       = null;
    this.activeEditor     = null;
    this.originalText     = "";
    this.from = 0;
    this.to   = 0;
    this.onRetryCallback  = null;
  }
}

// Singleton
export const inlineDiffManager = new InlineDiffManager();

// ── Helper: get CM6 selection offsets from an Obsidian Editor ────────────────
export function getSelectionOffsets(editor: Editor): { from: number; to: number } | null {
  const cm = getCmView(editor);
  if (!cm) return null;
  const sel = cm.state.selection.main;
  return { from: sel.from, to: sel.to };
}
