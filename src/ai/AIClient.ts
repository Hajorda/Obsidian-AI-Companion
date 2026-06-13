// ─── Unified AI Client ────────────────────────────────────────────────────────

import { GeminiProvider } from "./providers/GeminiProvider";
import type { AIResponse } from "./providers/GeminiProvider";
import { OpenAIProvider } from "./providers/OpenAIProvider";
import { ClaudeProvider } from "./providers/ClaudeProvider";
import { OpenRouterProvider } from "./providers/OpenRouterProvider";
import type { AICompanionSettings, AIProvider } from "../settings/settings";
import { buildPrompt, ACTION_TIER } from "./prompts";
import type { PromptAction, PromptContext } from "./prompts";

export type { AIResponse };

export interface HistoryEntry {
  id: string;
  timestamp: Date;
  provider: string;
  model: string;
  action: string;
  prompt: string;
  response: string;
  tokensUsed?: number;
}

export interface PendingRequest {
  id: string;
  action: string;
  prompt: string;
  startTime: Date;
  liveTokens: number;
  isStreaming: boolean;
}

// ── Provider types ─────────────────────────────────────────────────────────────
type ProviderInstance = GeminiProvider | OpenAIProvider | ClaudeProvider | OpenRouterProvider;

export class AIClient {
  private settings: AICompanionSettings;
  public history: HistoryEntry[] = [];

  /** Set when a request is in flight — used by HistoryPanel for live display */
  public pendingRequest: PendingRequest | null = null;

  /** Callbacks for live UI updates */
  public onRequestStart: ((pending: PendingRequest) => void) | null = null;
  public onRequestEnd: ((entry: HistoryEntry) => void) | null = null;
  public onTokenUpdate: ((tokens: number) => void) | null = null;

  constructor(settings: AICompanionSettings) {
    this.settings = settings;
  }

  updateSettings(settings: AICompanionSettings) {
    this.settings = settings;
  }

  // ── Provider factory ────────────────────────────────────────────────────────

  private getProvider(action?: PromptAction, override?: AIProvider): ProviderInstance {
    const p = override ?? this.settings.defaultProvider;

    // Per-tier model override — use a different model for the specific action's tier
    if (action && this.settings.useTierModels && p !== "openrouter") {
      const tier = ACTION_TIER[action];
      const tierModel = this.settings.tierModels[tier];
      if (tierModel) {
        return this.buildNativeProvider(p, tierModel);
      }
    }

    // OpenRouter with optional per-tier model selection
    if (p === "openrouter") {
      let model = this.settings.openrouterModel;
      if (action && this.settings.useTierModels) {
        const tier = ACTION_TIER[action];
        const tierModel = this.settings.tierModels[tier];
        if (tierModel) model = tierModel;  // OpenRouter tier model uses full id e.g. "google/gemini-2.5-flash"
      }
      return new OpenRouterProvider(this.settings.openrouterApiKey, model);
    }

    return this.buildNativeProvider(p, undefined);
  }

  private buildNativeProvider(
    p: AIProvider,
    modelOverride?: string
  ): GeminiProvider | OpenAIProvider | ClaudeProvider {
    switch (p) {
      case "openai":
        return new OpenAIProvider(
          this.settings.openaiApiKey,
          modelOverride ?? this.settings.openaiModel
        );
      case "claude":
        return new ClaudeProvider(
          this.settings.claudeApiKey,
          modelOverride ?? this.settings.claudeModel
        );
      case "gemini":
      default:
        return new GeminiProvider(
          this.settings.geminiApiKey,
          modelOverride ?? this.settings.geminiModel
        );
    }
  }

  /** Returns a human-readable label for the current effective model for a given action */
  getEffectiveModelLabel(action?: PromptAction): string {
    const p = this.settings.defaultProvider;
    if (action && this.settings.useTierModels) {
      const tier = ACTION_TIER[action];
      const tierModel = this.settings.tierModels[tier];
      if (tierModel) {
        const shortName = tierModel.split("/").pop() ?? tierModel;
        return shortName;
      }
    }
    switch (p) {
      case "openrouter": return (this.settings.openrouterModel.split("/").pop() ?? this.settings.openrouterModel);
      case "openai":     return this.settings.openaiModel;
      case "claude":     return this.settings.claudeModel;
      case "gemini":
      default:           return this.settings.geminiModel;
    }
  }

  // ── Pending request management ──────────────────────────────────────────────

  private startPending(action: string, prompt: string, isStreaming: boolean): string {
    const id = crypto.randomUUID();
    this.pendingRequest = { id, action, prompt, startTime: new Date(), liveTokens: 0, isStreaming };
    this.onRequestStart?.(this.pendingRequest);
    return id;
  }

  private finishPending(entry: HistoryEntry) {
    this.pendingRequest = null;
    this.history.unshift(entry);
    if (this.history.length > (this.settings.maxHistoryEntries ?? 200)) {
      this.history.length = this.settings.maxHistoryEntries ?? 200;
    }
    this.onRequestEnd?.(entry);
  }

  // ── Standard (non-streaming) request ───────────────────────────────────────

  async run(
    action: PromptAction,
    ctx: PromptContext,
    providerOverride?: AIProvider
  ): Promise<AIResponse> {
    const provider = this.getProvider(action, providerOverride);
    const userPrompt = buildPrompt(action, ctx);
    const pendingId = this.startPending(action, ctx.customInstruction ?? action, false);

    try {
      const response = await provider.complete(
        this.settings.systemPrompt,
        userPrompt,
        this.settings.temperature,
        this.settings.maxTokens
      );

      const entry: HistoryEntry = {
        id: pendingId,
        timestamp: new Date(),
        provider: response.provider,
        model: response.model,
        action,
        prompt: ctx.customInstruction ?? action,
        response: response.text,
        tokensUsed: response.tokensUsed,
      };
      this.finishPending(entry);
      return response;
    } catch (err) {
      this.pendingRequest = null;
      this.onRequestEnd?.({
        id: pendingId, timestamp: new Date(), provider: "error",
        model: "", action, prompt: "", response: "",
      });
      throw err;
    }
  }

  // ── Streaming request ────────────────────────────────────────────────────────

  async runStreaming(
    action: PromptAction,
    ctx: PromptContext,
    onChunk: (text: string) => void,
    providerOverride?: AIProvider
  ): Promise<AIResponse> {
    const provider = this.getProvider(action, providerOverride);
    const userPrompt = buildPrompt(action, ctx);
    const pendingId = this.startPending(action, ctx.customInstruction ?? action, true);

    try {
      const response = await provider.completeStream(
        this.settings.systemPrompt,
        userPrompt,
        (chunk, tokens) => {
          onChunk(chunk);
          if (this.pendingRequest) {
            this.pendingRequest.liveTokens = tokens;
            this.onTokenUpdate?.(tokens);
          }
        },
        this.settings.temperature,
        this.settings.maxTokens
      );

      const entry: HistoryEntry = {
        id: pendingId,
        timestamp: new Date(),
        provider: response.provider,
        model: response.model,
        action,
        prompt: ctx.customInstruction ?? action,
        response: response.text,
        tokensUsed: response.tokensUsed,
      };
      this.finishPending(entry);
      return response;
    } catch (err) {
      this.pendingRequest = null;
      this.onRequestEnd?.({
        id: pendingId, timestamp: new Date(), provider: "error",
        model: "", action, prompt: "", response: "",
      });
      throw err;
    }
  }

  // ── Convenience wrappers ─────────────────────────────────────────────────────

  async runCustom(
    userPrompt: string,
    selectedText?: string,
    providerOverride?: AIProvider
  ): Promise<AIResponse> {
    return this.run("custom", { selectedText, customInstruction: userPrompt }, providerOverride);
  }

  async runCustomStreaming(
    userPrompt: string,
    selectedText?: string,
    onChunk?: (text: string) => void,
    providerOverride?: AIProvider
  ): Promise<AIResponse> {
    return this.runStreaming(
      "custom",
      { selectedText, customInstruction: userPrompt },
      onChunk ?? (() => {}),
      providerOverride
    );
  }

  async testConnection(provider: AIProvider): Promise<boolean> {
    switch (provider) {
      case "openrouter":
        return new OpenRouterProvider(
          this.settings.openrouterApiKey,
          this.settings.openrouterModel
        ).testConnection();
      default:
        return this.buildNativeProvider(provider).testConnection();
    }
  }

  clearHistory() {
    this.history = [];
  }
}
