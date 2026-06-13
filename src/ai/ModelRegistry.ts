// ─── Model Registry ───────────────────────────────────────────────────────────
// Single source of truth for all model metadata.
// Static lists for Gemini / OpenAI / Claude.
// Live fetch from OpenRouter API (cached per session).

export type ModalityType = "text" | "image" | "audio" | "video" | "file";
export type ModelTier = "fast" | "balanced" | "powerful" | "creative";
export type ProviderKey = "google" | "openai" | "anthropic" | "openrouter";

export interface ModelInfo {
  id: string;
  name: string;
  providerKey: ProviderKey;
  providerLabel: string;
  emoji: string;
  tagline: string;
  description: string;
  contextLength: number;
  inputPricePerM: number;   // USD per 1M input tokens
  outputPricePerM: number;  // USD per 1M output tokens
  isFree: boolean;
  modalities: ModalityType[];
  defaultTier: ModelTier;
  isRecommended?: boolean;
}

// ── Static Gemini models ──────────────────────────────────────────────────────
export const GEMINI_MODELS: ModelInfo[] = [
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    providerKey: "google",
    providerLabel: "Google",
    emoji: "⚡",
    tagline: "Fast & capable — recommended",
    description: "Google's best value model. Near-Pro quality at Flash speed. Perfect for grammar, tone, and everyday edits.",
    contextLength: 1_048_576,
    inputPricePerM: 0.15,
    outputPricePerM: 0.60,
    isFree: false,
    modalities: ["text", "image"],
    defaultTier: "fast",
    isRecommended: true,
  },
  {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    providerKey: "google",
    providerLabel: "Google",
    emoji: "🧠",
    tagline: "Most powerful Google model",
    description: "Google's flagship. Best for complex reasoning, long summaries, and high-quality rewrites.",
    contextLength: 1_048_576,
    inputPricePerM: 1.25,
    outputPricePerM: 10.00,
    isFree: false,
    modalities: ["text", "image"],
    defaultTier: "powerful",
  },
  {
    id: "gemini-2.5-flash-lite",
    name: "Gemini 2.5 Flash Lite",
    providerKey: "google",
    providerLabel: "Google",
    emoji: "🏎️",
    tagline: "Ultra fast, ultra cheap",
    description: "Lightest Gemini model. Best for high-volume short tasks like grammar checks and tag generation.",
    contextLength: 1_048_576,
    inputPricePerM: 0.04,
    outputPricePerM: 0.15,
    isFree: false,
    modalities: ["text"],
    defaultTier: "fast",
  },
  {
    id: "gemini-1.5-flash",
    name: "Gemini 1.5 Flash",
    providerKey: "google",
    providerLabel: "Google",
    emoji: "🔄",
    tagline: "Stable, proven reliability",
    description: "Proven workhorse. Very stable. Good fallback if newer models aren't behaving.",
    contextLength: 1_048_576,
    inputPricePerM: 0.075,
    outputPricePerM: 0.30,
    isFree: false,
    modalities: ["text", "image"],
    defaultTier: "balanced",
  },
  {
    id: "gemini-1.5-pro",
    name: "Gemini 1.5 Pro",
    providerKey: "google",
    providerLabel: "Google",
    emoji: "📚",
    tagline: "2M token context window",
    description: "Longest context in the Gemini family. Perfect for full-book summaries and very long notes.",
    contextLength: 2_097_152,
    inputPricePerM: 1.25,
    outputPricePerM: 5.00,
    isFree: false,
    modalities: ["text", "image"],
    defaultTier: "powerful",
  },
];

// ── Static OpenAI models ──────────────────────────────────────────────────────
export const OPENAI_MODELS: ModelInfo[] = [
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    providerKey: "openai",
    providerLabel: "OpenAI",
    emoji: "⚡",
    tagline: "Fast and affordable",
    description: "Best value OpenAI model. Great for grammar fixes, quick Q&A, and short edits.",
    contextLength: 128_000,
    inputPricePerM: 0.15,
    outputPricePerM: 0.60,
    isFree: false,
    modalities: ["text", "image"],
    defaultTier: "fast",
    isRecommended: true,
  },
  {
    id: "gpt-4o",
    name: "GPT-4o",
    providerKey: "openai",
    providerLabel: "OpenAI",
    emoji: "🤖",
    tagline: "Flagship multimodal model",
    description: "OpenAI's flagship. Excellent reasoning and writing quality across all task types.",
    contextLength: 128_000,
    inputPricePerM: 2.50,
    outputPricePerM: 10.00,
    isFree: false,
    modalities: ["text", "image"],
    defaultTier: "balanced",
  },
  {
    id: "gpt-4-turbo",
    name: "GPT-4 Turbo",
    providerKey: "openai",
    providerLabel: "OpenAI",
    emoji: "🚀",
    tagline: "128K context, proven quality",
    description: "Reliable high-capability model with a large context window. Good for long-document work.",
    contextLength: 128_000,
    inputPricePerM: 10.00,
    outputPricePerM: 30.00,
    isFree: false,
    modalities: ["text", "image"],
    defaultTier: "powerful",
  },
  {
    id: "o1-mini",
    name: "o1 Mini",
    providerKey: "openai",
    providerLabel: "OpenAI",
    emoji: "🧮",
    tagline: "Chain-of-thought reasoning",
    description: "Reasoning-focused model. Slower but much better at complex logical tasks.",
    contextLength: 128_000,
    inputPricePerM: 1.50,
    outputPricePerM: 6.00,
    isFree: false,
    modalities: ["text"],
    defaultTier: "powerful",
  },
];

// ── Static Claude models ──────────────────────────────────────────────────────
export const CLAUDE_MODELS: ModelInfo[] = [
  {
    id: "claude-haiku-4-5",
    name: "Claude Haiku",
    providerKey: "anthropic",
    providerLabel: "Anthropic",
    emoji: "⚡",
    tagline: "Fastest Claude model",
    description: "Anthropic's fastest and cheapest model. Great for quick tone fixes and grammar checks.",
    contextLength: 200_000,
    inputPricePerM: 0.25,
    outputPricePerM: 1.25,
    isFree: false,
    modalities: ["text", "image"],
    defaultTier: "fast",
    isRecommended: true,
  },
  {
    id: "claude-sonnet-4-5",
    name: "Claude Sonnet",
    providerKey: "anthropic",
    providerLabel: "Anthropic",
    emoji: "✍️",
    tagline: "Best Claude for writing",
    description: "The sweet spot in the Claude family. Excellent writing quality and reasoning. Recommended for most tasks.",
    contextLength: 200_000,
    inputPricePerM: 3.00,
    outputPricePerM: 15.00,
    isFree: false,
    modalities: ["text", "image", "file"],
    defaultTier: "balanced",
    isRecommended: true,
  },
  {
    id: "claude-opus-4-5",
    name: "Claude Opus",
    providerKey: "anthropic",
    providerLabel: "Anthropic",
    emoji: "🎭",
    tagline: "Most powerful Claude",
    description: "Anthropic's most capable model. Best for complex creative writing and deep analysis.",
    contextLength: 200_000,
    inputPricePerM: 15.00,
    outputPricePerM: 75.00,
    isFree: false,
    modalities: ["text", "image", "file"],
    defaultTier: "creative",
  },
];

// ── Provider metadata ─────────────────────────────────────────────────────────
export const PROVIDER_META: Record<ProviderKey, { label: string; emoji: string; color: string }> = {
  google:     { label: "Google",     emoji: "🔵", color: "#4285F4" },
  openai:     { label: "OpenAI",     emoji: "🟢", color: "#10a37f" },
  anthropic:  { label: "Anthropic",  emoji: "🟣", color: "#c084fc" },
  openrouter: { label: "OpenRouter", emoji: "🔀", color: "#f97316" },
};

export function getStaticModels(provider: ProviderKey): ModelInfo[] {
  switch (provider) {
    case "google":    return GEMINI_MODELS;
    case "openai":    return OPENAI_MODELS;
    case "anthropic": return CLAUDE_MODELS;
    default:          return [];
  }
}

// ── OpenRouter live fetch ─────────────────────────────────────────────────────
export interface OpenRouterModelRaw {
  id: string;
  name: string;
  description: string;
  context_length: number;
  pricing: { prompt: string; completion: string };
  architecture: { modality: string; input_modalities: string[] };
}

let _openrouterCache: ModelInfo[] | null = null;
let _openrouterFetchedAt = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 min

export async function fetchOpenRouterModels(forceRefresh = false): Promise<ModelInfo[]> {
  const now = Date.now();
  if (!forceRefresh && _openrouterCache && now - _openrouterFetchedAt < CACHE_TTL_MS) {
    return _openrouterCache;
  }

  const resp = await fetch("https://openrouter.ai/api/v1/models", {
    headers: { "Accept": "application/json" },
  });

  if (!resp.ok) throw new Error(`OpenRouter models fetch failed: HTTP ${resp.status}`);

  const json = (await resp.json()) as { data: OpenRouterModelRaw[] };

  const models: ModelInfo[] = json.data
    .filter((m) => {
      // Only text-output models
      const out = m.architecture?.modality ?? "";
      return out.includes("text");
    })
    .map((m) => {
      const inputPrice = parseFloat(m.pricing?.prompt ?? "0") * 1_000_000;
      const outputPrice = parseFloat(m.pricing?.completion ?? "0") * 1_000_000;
      const isFree = inputPrice === 0 && outputPrice === 0;

      // Parse provider slug from id "provider/model-name"
      const providerSlug = m.id.split("/")[0] ?? "other";

      // Parse modalities
      const rawModalities: string[] = m.architecture?.input_modalities ?? [];
      const modalities: ModalityType[] = rawModalities.filter((mod): mod is ModalityType =>
        ["text", "image", "audio", "video", "file"].includes(mod)
      );

      // Assign default tier based on price
      let defaultTier: ModelTier = "balanced";
      if (isFree || inputPrice < 0.5)      defaultTier = "fast";
      else if (inputPrice < 3)              defaultTier = "balanced";
      else if (inputPrice < 15)             defaultTier = "powerful";
      else                                  defaultTier = "creative";

      return {
        id: m.id,
        name: m.name,
        providerKey: "openrouter" as ProviderKey,
        providerLabel: providerSlug,
        emoji: getProviderEmoji(providerSlug),
        tagline: isFree ? "Free to use" : formatPrice(inputPrice, outputPrice),
        description: m.description ?? "",
        contextLength: m.context_length ?? 0,
        inputPricePerM: inputPrice,
        outputPricePerM: outputPrice,
        isFree,
        modalities: modalities.length > 0 ? modalities : ["text"],
        defaultTier,
      };
    });

  _openrouterCache = models;
  _openrouterFetchedAt = now;
  return models;
}

export function clearOpenRouterCache() {
  _openrouterCache = null;
  _openrouterFetchedAt = 0;
}

// ── Display helpers ───────────────────────────────────────────────────────────
export function formatContextLength(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`;
  return `${n}`;
}

export function formatPrice(inputPerM: number, outputPerM: number): string {
  const fmt = (n: number) => n < 0.01 ? `$${n.toFixed(3)}` : `$${n.toFixed(2)}`;
  return `${fmt(inputPerM)} in / ${fmt(outputPerM)} out per 1M`;
}

export function getPriceCategory(inputPerM: number): "free" | "budget" | "mid" | "premium" {
  if (inputPerM === 0)   return "free";
  if (inputPerM < 1)     return "budget";
  if (inputPerM < 10)    return "mid";
  return "premium";
}

export function getPriceBadge(inputPerM: number): { emoji: string; label: string; cls: string } {
  const cat = getPriceCategory(inputPerM);
  switch (cat) {
    case "free":    return { emoji: "🆓", label: "FREE",         cls: "aic-price-free"    };
    case "budget":  return { emoji: "💚", label: `$${inputPerM.toFixed(2)}/1M`, cls: "aic-price-budget" };
    case "mid":     return { emoji: "🟡", label: `$${inputPerM.toFixed(1)}/1M`, cls: "aic-price-mid"    };
    case "premium": return { emoji: "🔴", label: `$${inputPerM.toFixed(0)}/1M`, cls: "aic-price-premium" };
  }
}

export function getModalityIcons(modalities: ModalityType[]): string {
  const map: Record<ModalityType, string> = {
    text: "📝", image: "🖼️", audio: "🎵", video: "📹", file: "📄",
  };
  return modalities.map((m) => map[m] ?? "").join(" ");
}

export function getTierInfo(tier: ModelTier): { emoji: string; label: string; description: string } {
  const map: Record<ModelTier, { emoji: string; label: string; description: string }> = {
    fast:      { emoji: "⚡", label: "Fast",      description: "Grammar, tone, translate — speed matters" },
    balanced:  { emoji: "⚖️", label: "Balanced",  description: "Improve, explain, elaborate — everyday tasks" },
    powerful:  { emoji: "🧠", label: "Powerful",  description: "Summaries, outlines, meeting notes — quality first" },
    creative:  { emoji: "🎨", label: "Creative",  description: "Style rewrites, continue writing — needs creativity" },
  };
  return map[tier];
}

function getProviderEmoji(slug: string): string {
  const map: Record<string, string> = {
    google:     "🔵", openai: "🟢", anthropic: "🟣", meta: "🔷",
    mistralai:  "🌊", deepseek: "🔴", qwen: "🟠", "x-ai": "✖️",
    nvidia:     "💚", cohere: "🔶", "01-ai": "🟤", microsoft: "🔵",
  };
  return map[slug] ?? "⚪";
}
