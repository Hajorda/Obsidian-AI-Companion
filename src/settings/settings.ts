// ─── Settings Interface & Defaults ────────────────────────────────────────────

export type AIProvider = "gemini" | "openai" | "claude" | "openrouter";
export type DiffViewMode = "inline" | "sidebyside";
export type ModelTier = "fast" | "balanced" | "powerful" | "creative";

// ── Custom user types ─────────────────────────────────────────────────────────

export interface PromptLibraryItem {
  id: string;
  name: string;
  prompt: string;
  category: string;
  showInQuickActions?: boolean;
  icon?: string;
}

export interface CustomQuickAction {
  id: string;
  label: string;
  icon: string;
  prompt: string;
}

/** Per-tier model overrides. Empty string = use provider default. */
export interface TierModels {
  fast:      string;
  balanced:  string;
  powerful:  string;
  creative:  string;
}

// ── Main settings interface ───────────────────────────────────────────────────

export interface AICompanionSettings {
  // ── Providers ────────────────────────────────────────────────────────────
  defaultProvider: AIProvider;

  geminiApiKey: string;
  geminiModel: string;

  openaiApiKey: string;
  openaiModel: string;

  claudeApiKey: string;
  claudeModel: string;

  openrouterApiKey: string;
  openrouterModel: string;      // global default OpenRouter model

  // ── Per-tier model overrides ──────────────────────────────────────────────
  // When set, overrides the provider default for that action tier.
  // Format: "gemini-2.5-flash" for native providers, "google/gemini-2.5-flash" for OpenRouter.
  tierModels: TierModels;
  useTierModels: boolean;  // master toggle for tier routing

  // ── Global behavior ───────────────────────────────────────────────────────
  systemPrompt: string;
  temperature: number;
  maxTokens: number;

  // ── Streaming ─────────────────────────────────────────────────────────────
  enableStreaming: boolean;

  // ── Shortcuts ─────────────────────────────────────────────────────────────
  shortcutInlineEditor: string;
  shortcutAIPaste: string;

  // ── Automation features ───────────────────────────────────────────────────
  autoSuggestOnPaste: boolean;
  autoSuggestMinChars: number;
  slashCommandsEnabled: boolean;
  autoSuggestTitle: boolean;     // Auto-title on note creation

  // ── UI ────────────────────────────────────────────────────────────────────
  diffViewMode: DiffViewMode;
  showHistoryPanel: boolean;
  showFloatingButton: boolean;

  // ── Prompt library & custom actions ──────────────────────────────────────
  promptLibrary: PromptLibraryItem[];
  customQuickActions: CustomQuickAction[];

  // ── Persistent history ────────────────────────────────────────────────────
  historyFilePath: string;
  maxHistoryEntries: number;
  hasSeenWelcome: boolean;
}

export const INITIAL_DEFAULT_PROMPTS: PromptLibraryItem[] = [
  {
    id: "builtin-improve",
    name: "Improve writing",
    prompt: "Improve the writing quality of the following text. Return ONLY the improved text, no explanation.",
    category: "Editing",
    showInQuickActions: true,
    icon: "sparkles"
  },
  {
    id: "builtin-grammar",
    name: "Fix grammar",
    prompt: "Fix all grammar, spelling, and punctuation errors in the following text. Return ONLY the corrected text.",
    category: "Editing",
    showInQuickActions: true,
    icon: "check-circle"
  },
  {
    id: "builtin-concise",
    name: "Make concise",
    prompt: "Rewrite the following text to be more concise. Preserve all key information. Return ONLY the condensed text.",
    category: "Editing",
    showInQuickActions: true,
    icon: "minimize-2"
  },
  {
    id: "builtin-elaborate",
    name: "Elaborate details",
    prompt: "Expand and elaborate on the following text. Add relevant detail and depth. Return ONLY the expanded text.",
    category: "Writing",
    showInQuickActions: true,
    icon: "maximize-2"
  },
  {
    id: "builtin-translate",
    name: "Translate text",
    prompt: "Translate the following text to English. Return ONLY the translation.",
    category: "Editing",
    showInQuickActions: true,
    icon: "globe"
  },
  {
    id: "builtin-explain",
    name: "Explain selection",
    prompt: "Explain the following text clearly and concisely. Be conversational.",
    category: "Research",
    showInQuickActions: true,
    icon: "help-circle"
  }
];

export const DEFAULT_SETTINGS: AICompanionSettings = {
  defaultProvider: "gemini",

  geminiApiKey: "",
  geminiModel: "gemini-2.5-flash",

  openaiApiKey: "",
  openaiModel: "gpt-4o-mini",

  claudeApiKey: "",
  claudeModel: "claude-haiku-4-5",

  openrouterApiKey: "",
  openrouterModel: "google/gemini-2.5-flash",

  tierModels: {
    fast:     "",   // "" = use provider default
    balanced: "",
    powerful: "",
    creative: "",
  },
  useTierModels: false,

  systemPrompt:
    "You are a helpful writing assistant integrated into Obsidian. Be concise and precise. When editing text, return only the edited text without explanation unless asked.",
  temperature: 0.7,
  maxTokens: 2048,

  enableStreaming: true,

  shortcutInlineEditor: "Mod+Shift+A",
  shortcutAIPaste: "Mod+Shift+V",

  autoSuggestOnPaste: true,
  autoSuggestMinChars: 200,
  slashCommandsEnabled: true,
  autoSuggestTitle: true,

  diffViewMode: "sidebyside",
  showHistoryPanel: true,
  showFloatingButton: true,

  promptLibrary: INITIAL_DEFAULT_PROMPTS,
  customQuickActions: [],

  historyFilePath: "_ai-companion/history.json",
  maxHistoryEntries: 200,
  hasSeenWelcome: false,
};
