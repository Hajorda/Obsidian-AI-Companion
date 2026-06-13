// ─── Inline Diff Extension (CodeMirror 6) — v2 ────────────────────────────────
// VS Code Copilot-style inline diff with:
//   • Action bar (Accept / Reject / Retry / Toggle view) — slides in above the change
//   • Green highlight marks on inserted text
//   • Red strikethrough widgets for deleted text
//   • Gutter change markers (green bar on changed lines, like Git gutter)
//   • Keyboard shortcuts: Escape = Reject, Cmd+Enter = Accept
//   • Word count delta in the action bar

import {
  StateField,
  StateEffect,
  Range,
  RangeSet,
  Transaction,
  EditorSelection,
} from "@codemirror/state";
import {
  EditorView,
  Decoration,
  WidgetType,
  DecorationSet,
  gutter,
  GutterMarker,
  keymap,
} from "@codemirror/view";

// ── Diff chunk types ──────────────────────────────────────────────────────────
export type DiffOp = "equal" | "insert" | "delete";

export interface DiffChunk {
  op: DiffOp;
  text: string;
}

// ── State held while an inline diff is active ─────────────────────────────────
export interface InlineDiffState {
  originalText: string;
  from: number;
  to: number;
  chunks: DiffChunk[];
  showDiff: boolean;
  wordDelta: number;   // aiWords - originalWords (negative = shorter, positive = longer)
}

// ── StateEffects ──────────────────────────────────────────────────────────────
export const setInlineDiff       = StateEffect.define<InlineDiffState>();
export const clearInlineDiff     = StateEffect.define<null>();
export const toggleInlineDiffView = StateEffect.define<null>();

// ── Callbacks wired by InlineDiffManager ─────────────────────────────────────
export interface InlineDiffCallbacks {
  onAccept: () => void;
  onReject: () => void;
  onToggle: () => void;
  onRetry:  () => void;
}

let _callbacks: InlineDiffCallbacks | null = null;
export function setInlineDiffCallbacks(cb: InlineDiffCallbacks) { _callbacks = cb; }
export function clearInlineDiffCallbacks() { _callbacks = null; }

// ── Helpers ───────────────────────────────────────────────────────────────────
function makeSvg(path: string): string {
  return `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
}

const ICON_ACCEPT = makeSvg('<polyline points="2,9 6,13 14,3"/>');
const ICON_REJECT = makeSvg('<line x1="3" y1="3" x2="13" y2="13"/><line x1="13" y1="3" x2="3" y2="13"/>');
const ICON_RETRY  = makeSvg('<path d="M2 8a6 6 0 1 0 1.5-4"/><polyline points="2,2 2,6 6,6"/>');
const ICON_DIFF   = makeSvg('<rect x="2" y="3" width="5" height="10" rx="1.2"/><rect x="9" y="3" width="5" height="10" rx="1.2"/>');
const ICON_PLAIN  = makeSvg('<path d="M3 4h10M3 8h10M3 12h7"/>');

// ── Action bar widget ─────────────────────────────────────────────────────────
class ActionBarWidget extends WidgetType {
  constructor(
    private showDiff: boolean,
    private wordDelta: number
  ) { super(); }

  eq(other: ActionBarWidget) {
    return other.showDiff === this.showDiff && other.wordDelta === this.wordDelta;
  }

  toDOM(): HTMLElement {
    const bar = document.createElement("div");
    bar.className = "aic-inline-bar";
    bar.setAttribute("aria-label", "AI edit controls");

    // ── Label ────────────────────────────────────────────────────────────────
    const label = bar.appendChild(document.createElement("span"));
    label.className = "aic-inline-bar-label";
    label.textContent = "AI edit";

    // ── Word delta badge ──────────────────────────────────────────────────────
    if (this.wordDelta !== 0) {
      const delta = bar.appendChild(document.createElement("span"));
      delta.className = "aic-inline-delta " + (this.wordDelta < 0 ? "aic-inline-delta-less" : "aic-inline-delta-more");
      delta.textContent = (this.wordDelta > 0 ? "+" : "") + this.wordDelta + " words";
      delta.title = this.wordDelta < 0
        ? `${Math.abs(this.wordDelta)} fewer words than original`
        : `${this.wordDelta} more words than original`;
    }

    // ── Separator ─────────────────────────────────────────────────────────────
    bar.appendChild(document.createElement("div")).className = "aic-inline-bar-sep";

    // ── Accept ────────────────────────────────────────────────────────────────
    const accept = this._btn(bar, "aic-inline-btn-accept", ICON_ACCEPT, "Accept", "Accept changes (⌘↵)");
    accept.onclick = (e) => { e.stopPropagation(); _callbacks?.onAccept(); };

    // ── Reject ────────────────────────────────────────────────────────────────
    const reject = this._btn(bar, "aic-inline-btn-reject", ICON_REJECT, "Reject", "Reject changes (⎋)");
    reject.onclick = (e) => { e.stopPropagation(); _callbacks?.onReject(); };

    // ── Retry ─────────────────────────────────────────────────────────────────
    const retry = this._btn(bar, "aic-inline-btn-retry", ICON_RETRY, "Retry", "Reject and re-run the AI prompt");
    retry.onclick = (e) => { e.stopPropagation(); _callbacks?.onRetry(); };

    // ── Separator ─────────────────────────────────────────────────────────────
    bar.appendChild(document.createElement("div")).className = "aic-inline-bar-sep";

    // ── Toggle view ───────────────────────────────────────────────────────────
    const toggle = this._btn(
      bar,
      "aic-inline-btn-toggle" + (this.showDiff ? " aic-inline-btn-toggle-active" : ""),
      this.showDiff ? ICON_DIFF : ICON_PLAIN,
      this.showDiff ? "Diff" : "Clean",
      this.showDiff ? "Showing changes — click for plain view" : "Showing plain view — click for diff view"
    );
    toggle.onclick = (e) => { e.stopPropagation(); _callbacks?.onToggle(); };

    return bar;
  }

  private _btn(parent: HTMLElement, cls: string, icon: string, label: string, tooltip: string): HTMLButtonElement {
    const btn = parent.appendChild(document.createElement("button"));
    btn.className = "aic-inline-btn " + cls;
    btn.title = tooltip;
    btn.innerHTML = icon + `<span>${label}</span>`;
    return btn;
  }

  ignoreEvent() { return false; }
}

// ── Deleted-text widget ───────────────────────────────────────────────────────
class DeletedTextWidget extends WidgetType {
  constructor(private text: string) { super(); }
  eq(other: DeletedTextWidget) { return other.text === this.text; }

  toDOM(): HTMLElement {
    const el = document.createElement("span");
    el.className = "aic-inline-del";
    el.textContent = this.text;
    el.setAttribute("aria-label", "Deleted: " + this.text);
    return el;
  }

  ignoreEvent() { return true; }
}

// ── Gutter change marker ──────────────────────────────────────────────────────
class ChangeGutterMarker extends GutterMarker {
  constructor(private type: "changed" | "added") { super(); }

  toDOM(): HTMLElement {
    const el = document.createElement("div");
    el.className = "aic-gutter-marker aic-gutter-" + this.type;
    return el;
  }
}

const changedMarker = new ChangeGutterMarker("changed");

// ── Build decorations from diff state ─────────────────────────────────────────
function buildDecorations(state: InlineDiffState | null): DecorationSet {
  if (!state) return Decoration.none;

  const { from, chunks, showDiff } = state;
  const decorations: Range<Decoration>[] = [];

  // Action bar — block widget before the first change position
  decorations.push(
    Decoration.widget({
      widget: new ActionBarWidget(showDiff, state.wordDelta),
      side: -1,
      block: true,
    }).range(from)
  );

  let pos = from;
  let pendingDeletes: string[] = [];

  for (const chunk of chunks) {
    if (chunk.op === "delete") {
      if (showDiff) pendingDeletes.push(chunk.text);
      continue; // deleted text NOT in document
    }

    const end = pos + chunk.text.length;

    // Flush pending deletes as widgets before this chunk
    if (pendingDeletes.length > 0 && showDiff) {
      decorations.push(
        Decoration.widget({
          widget: new DeletedTextWidget(pendingDeletes.join("")),
          side: -1,
        }).range(pos)
      );
      pendingDeletes = [];
    }

    if (chunk.op === "insert") {
      decorations.push(Decoration.mark({ class: "aic-inline-ins" }).range(pos, end));
    }

    pos = end;
  }

  // Trailing deletes
  if (pendingDeletes.length > 0 && showDiff) {
    decorations.push(
      Decoration.widget({
        widget: new DeletedTextWidget(pendingDeletes.join("")),
        side: 1,
      }).range(pos)
    );
  }

  decorations.sort((a, b) => a.from - b.from || a.startSide - b.startSide);
  return RangeSet.of(decorations, true);
}

// ── Build gutter markers from diff state ──────────────────────────────────────
function buildGutterMarkers(state: InlineDiffState | null, doc: { lineAt(pos: number): { number: number; from: number; to: number; } }): RangeSet<GutterMarker> {
  if (!state) return RangeSet.empty;

  const { from, to } = state;
  const markers: Range<GutterMarker>[] = [];
  const startLine = doc.lineAt(from).number;
  const endLine   = doc.lineAt(to).number;

  for (let n = startLine; n <= endLine; n++) {
    const line = (doc as any).line(n);
    markers.push(changedMarker.range(line.from));
  }

  return RangeSet.of(markers);
}

// ── StateField ────────────────────────────────────────────────────────────────
export const inlineDiffField = StateField.define<InlineDiffState | null>({
  create: () => null,

  update(prev: InlineDiffState | null, tr: Transaction): InlineDiffState | null {
    for (const effect of tr.effects) {
      if (effect.is(setInlineDiff))        return effect.value;
      if (effect.is(clearInlineDiff))      return null;
      if (effect.is(toggleInlineDiffView) && prev) return { ...prev, showDiff: !prev.showDiff };
    }
    return prev;
  },

  provide: (f) =>
    EditorView.decorations.from(f, (state) => buildDecorations(state)),
});

// ── Gutter for changed-line indicators ───────────────────────────────────────
const diffGutter = gutter({
  class: "aic-diff-gutter",
  markers(view) {
    const state = view.state.field(inlineDiffField);
    if (!state) return RangeSet.empty;
    return buildGutterMarkers(state, view.state.doc as any);
  },
  lineMarkerChange(update) {
    return update.startState.field(inlineDiffField) !== update.state.field(inlineDiffField);
  },
});

// ── Keyboard shortcuts ────────────────────────────────────────────────────────
const diffKeymap = keymap.of([
  {
    key: "Escape",
    run(view) {
      if (!view.state.field(inlineDiffField)) return false;
      _callbacks?.onReject();
      return true;
    },
  },
  {
    key: "Mod-Enter",
    run(view) {
      if (!view.state.field(inlineDiffField)) return false;
      _callbacks?.onAccept();
      return true;
    },
  },
]);

// ── Theme ─────────────────────────────────────────────────────────────────────
export const inlineDiffTheme = EditorView.baseTheme({
  ".aic-diff-gutter": {
    width: "4px",
    minWidth: "4px",
  },
  ".aic-gutter-marker": {
    width: "3px",
    borderRadius: "2px",
    margin: "1px 0",
    minHeight: "calc(1em + 2px)",
  },
  ".aic-gutter-changed": {
    background: "hsl(142, 60%, 42%)",
  },
});

/** The full CM6 extension — registered via registerEditorExtension in main.ts */
export const inlineDiffExtension = [
  inlineDiffField,
  diffGutter,
  diffKeymap,
  inlineDiffTheme,
];
