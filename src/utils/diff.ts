// ─── Diff Utilities (wrapper around diff-match-patch) ─────────────────────────
// We ship our own lightweight implementation to avoid the npm dependency

export interface DiffChunk {
  type: "equal" | "insert" | "delete";
  value: string;
}

/**
 * Word-level diff between two strings.
 * Returns an array of chunks describing the changes.
 */
export function computeWordDiff(original: string, revised: string): DiffChunk[] {
  const origWords = tokenize(original);
  const revWords = tokenize(revised);

  const dp = buildLCS(origWords, revWords);
  return buildDiff(origWords, revWords, dp);
}

function tokenize(text: string): string[] {
  // Split on word boundaries, preserving spaces and punctuation
  return text.match(/\S+|\s+/g) ?? [];
}

function buildLCS(a: string[], b: string[]): number[][] {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  return dp;
}

function buildDiff(a: string[], b: string[], dp: number[][]): DiffChunk[] {
  const chunks: DiffChunk[] = [];
  let i = a.length;
  let j = b.length;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      chunks.unshift({ type: "equal", value: a[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      chunks.unshift({ type: "insert", value: b[j - 1] });
      j--;
    } else {
      chunks.unshift({ type: "delete", value: a[i - 1] });
      i--;
    }
  }

  // Merge consecutive same-type chunks
  return mergeSame(chunks);
}

function mergeSame(chunks: DiffChunk[]): DiffChunk[] {
  if (chunks.length === 0) return chunks;
  const merged: DiffChunk[] = [chunks[0]];
  for (let i = 1; i < chunks.length; i++) {
    const prev = merged[merged.length - 1];
    const curr = chunks[i];
    if (prev.type === curr.type) {
      prev.value += curr.value;
    } else {
      merged.push({ ...curr });
    }
  }
  return merged;
}

/**
 * Render diff chunks to HTML for inline view.
 */
export function renderInlineDiffHTML(chunks: DiffChunk[]): string {
  return chunks
    .map((c) => {
      const escaped = escapeHtml(c.value);
      if (c.type === "insert") return `<ins class="aic-diff-ins">${escaped}</ins>`;
      if (c.type === "delete") return `<del class="aic-diff-del">${escaped}</del>`;
      return `<span class="aic-diff-eq">${escaped}</span>`;
    })
    .join("");
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
