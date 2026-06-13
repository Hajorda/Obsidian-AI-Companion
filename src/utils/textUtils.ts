// ─── Text & Selection Utilities ───────────────────────────────────────────────

import { Editor } from "obsidian";
import type { EditorPosition } from "obsidian";

export interface SelectionInfo {
  text: string;
  from: EditorPosition;
  to: EditorPosition;
  hasSelection: boolean;
}

/**
 * Get the current selection or, if none, the paragraph under the cursor.
 */
export function getSelectionOrParagraph(editor: Editor): SelectionInfo {
  const selected = editor.getSelection();

  if (selected) {
    return {
      text: selected,
      from: editor.getCursor("from"),
      to: editor.getCursor("to"),
      hasSelection: true,
    };
  }

  // Fall back to the current paragraph
  const cursor = editor.getCursor();
  const line = cursor.line;
  const lineText = editor.getLine(line);

  return {
    text: lineText,
    from: { line, ch: 0 },
    to: { line, ch: lineText.length },
    hasSelection: false,
  };
}

/**
 * Replace a range in the editor with new text.
 */
export function replaceRange(
  editor: Editor,
  newText: string,
  from: EditorPosition,
  to: EditorPosition
) {
  editor.replaceRange(newText, from, to);
}

/**
 * Insert text below the current cursor line.
 */
export function insertBelow(editor: Editor, text: string) {
  const cursor = editor.getCursor();
  const line = cursor.line;
  const totalLines = editor.lineCount();
  const insertLine = Math.min(line + 1, totalLines);
  editor.replaceRange(`\n\n${text}\n`, { line: insertLine, ch: 0 });
}

/**
 * Get the full note content.
 */
export function getFullNote(editor: Editor): string {
  return editor.getValue();
}

/**
 * Detect fenced code blocks in text.
 */
export function extractCodeBlocks(text: string): string[] {
  const matches = text.match(/```[\s\S]*?```/g);
  return matches ?? [];
}
