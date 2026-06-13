// ─── Prompt Templates ─────────────────────────────────────────────────────────
import type { ModelTier } from "./ModelRegistry";

export type PromptAction =
  | "improve"
  | "grammar"
  | "concise"
  | "elaborate"
  | "translate"
  | "explain"
  | "summarize_note"
  | "generate_title"
  | "generate_tags"
  | "continue_writing"
  | "create_outline"
  | "explain_code"
  | "refactor_paste"
  // ── Batch 3 ──────────────────────────────────────
  | "meeting_notes"
  | "tone_formal"
  | "tone_casual"
  | "tone_academic"
  | "tone_friendly"
  | "tone_blunt"
  | "rewrite_style"
  | "custom";

export interface PromptContext {
  selectedText?: string;
  fullNote?: string;
  customInstruction?: string;
  targetLanguage?: string;
  styleTarget?: string;  // for rewrite_style: "Hemingway", "Tweet", etc.
}

// ── Tier mapping — which quality tier each action needs ──────────────────────
// Used by AIClient to pick the right model when per-tier models are configured.
export const ACTION_TIER: Record<PromptAction, ModelTier> = {
  grammar:          "fast",
  concise:          "fast",
  translate:        "fast",
  generate_title:   "fast",
  generate_tags:    "fast",
  tone_formal:      "fast",
  tone_casual:      "fast",
  tone_academic:    "fast",
  tone_friendly:    "fast",
  tone_blunt:       "fast",
  improve:          "balanced",
  elaborate:        "balanced",
  explain:          "balanced",
  explain_code:     "balanced",
  refactor_paste:   "balanced",
  custom:           "balanced",
  rewrite_style:    "creative",
  continue_writing: "creative",
  summarize_note:   "powerful",
  create_outline:   "powerful",
  meeting_notes:    "powerful",
};

export function buildPrompt(action: PromptAction, ctx: PromptContext): string {
  const text = ctx.selectedText ?? ctx.fullNote ?? "";

  switch (action) {
    case "improve":
      return `Improve the writing quality of the following text. Return ONLY the improved text, no explanation:\n\n${text}`;

    case "grammar":
      return `Fix all grammar, spelling, and punctuation errors in the following text. Return ONLY the corrected text:\n\n${text}`;

    case "concise":
      return `Rewrite the following text to be more concise. Preserve all key information. Return ONLY the condensed text:\n\n${text}`;

    case "elaborate":
      return `Expand and elaborate on the following text. Add relevant detail and depth. Return ONLY the expanded text:\n\n${text}`;

    case "translate":
      return `Translate the following text to ${ctx.targetLanguage ?? "English"}. Return ONLY the translation:\n\n${text}`;

    case "explain":
      return `Explain the following text clearly and concisely. Be conversational:\n\n${text}`;

    case "summarize_note":
      return `Summarize the following Obsidian note in a clear, structured way. Use bullet points for key takeaways:\n\n${text}`;

    case "generate_title":
      return `Generate a concise, descriptive title for the following note. Return ONLY the title, no quotes or extra punctuation:\n\n${text}`;

    case "generate_tags":
      return `Generate 5-10 relevant tags for this Obsidian note. Return ONLY a comma-separated list of lowercase tags without the # symbol:\n\n${text}`;

    case "continue_writing":
      return `Continue writing from where this text ends. Match the tone and style exactly. Return ONLY the continuation, do not repeat the original text:\n\n${text}`;

    case "create_outline":
      return `Create a structured markdown outline with headings (##, ###) for the following content. Return ONLY the outline:\n\n${text}`;

    case "explain_code":
      return `Explain what the following code does in plain English. Be clear and beginner-friendly:\n\n${text}`;

    case "refactor_paste":
      return `Refactor and clean up the following text for use in a note. Fix formatting, remove filler words, improve readability. Return ONLY the refactored text:\n\n${text}`;

    // ── Batch 3: Meeting notes ──────────────────────────────────────────────────
    case "meeting_notes":
      return `Convert the following raw meeting notes into a structured markdown document. Use exactly these sections (omit sections with no content):

## Meeting Summary
**Date**: [date if mentioned, or today's date]
**Attendees**: [names or roles if mentioned]

### Agenda
[bullet list of topics discussed]

### Key Decisions
[bullet list of decisions made]

### Action Items
- [ ] [task] — [owner if mentioned]

### Notes
[any other important context or discussion]

Return ONLY the formatted markdown. Do not add any preamble or explanation.

Raw notes:
${text}`;

    // ── Batch 3: Tone adjustments ───────────────────────────────────────────────
    case "tone_formal":
      return `Rewrite the following text in a formal, professional tone. Use precise vocabulary, avoid contractions, and maintain a respectful authoritative voice. Return ONLY the rewritten text:\n\n${text}`;

    case "tone_casual":
      return `Rewrite the following text in a casual, conversational tone. Use contractions, simple words, and write as if talking to a friend. Return ONLY the rewritten text:\n\n${text}`;

    case "tone_academic":
      return `Rewrite the following text in an academic tone. Use scholarly vocabulary, hedge claims appropriately, and structure arguments formally. Return ONLY the rewritten text:\n\n${text}`;

    case "tone_friendly":
      return `Rewrite the following text in a warm, approachable, and encouraging tone. Be positive, empathetic, and enthusiastic. Return ONLY the rewritten text:\n\n${text}`;

    case "tone_blunt":
      return `Rewrite the following text to be extremely direct and concise. Remove all hedging, filler words, pleasantries, and unnecessary qualifications. Get straight to the point. Return ONLY the rewritten text:\n\n${text}`;

    // ── Batch 3: Rewrite in style of ─────────────────────────────────────────
    case "rewrite_style": {
      const style = ctx.styleTarget ?? "Hemingway";
      return `Rewrite the following text in the style of ${style}. Adapt the voice, vocabulary, sentence structure, and rhythm to authentically match ${style}'s signature style while preserving the original meaning. Return ONLY the rewritten text:\n\n${text}`;
    }

    case "custom":
      return `${ctx.customInstruction ?? "Help with the following"}\n\n${text ? `Text:\n${text}` : ""}`;

    default:
      return text;
  }
}

/**
 * Classify whether an AI response should be shown as an EDIT (diff view)
 * or an ANSWER (reply bubble).
 */
export function classifyResponseIntent(
  prompt: string,
  _response: string
): "edit" | "answer" {
  const editActions: PromptAction[] = [
    "improve", "grammar", "concise", "elaborate", "translate",
    "refactor_paste", "continue_writing", "create_outline",
    "tone_formal", "tone_casual", "tone_academic", "tone_friendly", "tone_blunt",
    "rewrite_style", "meeting_notes",
  ];

  // Check if prompt matches a known edit action
  for (const a of editActions) {
    if (prompt === a) return "edit";
  }

  // Keyword checks for custom prompts
  const lc = prompt.toLowerCase();
  const answerKeywords = ["explain", "what", "why", "how", "who", "when", "where",
    "summarize", "generate", "list", "describe", "?"];
  const editKeywords = ["rewrite", "fix", "improve", "translate", "make",
    "change", "convert", "format", "tone", "style", "formal", "casual"];

  if (editKeywords.some((k) => lc.startsWith(k))) return "edit";
  if (answerKeywords.some((k) => lc.startsWith(k) || lc.includes(k))) return "answer";

  return "edit"; // default to edit for selection-based actions
}
