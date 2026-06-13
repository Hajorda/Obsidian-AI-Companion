// ─── OpenRouter Provider ──────────────────────────────────────────────────────
// OpenRouter is OpenAI-API compatible. Uses the same chat completions format.
// Extra headers identify the app to OpenRouter for analytics.

import type { AIResponse } from "./GeminiProvider";

export class OpenRouterProvider {
  private apiKey: string;
  private model: string;
  private baseUrl = "https://openrouter.ai/api/v1";
  private extraHeaders = {
    "HTTP-Referer": "obsidian-ai-companion",
    "X-Title": "AI Companion",
  };

  constructor(apiKey: string, model: string) {
    this.apiKey = apiKey;
    this.model = model;
  }

  private buildHeaders() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.apiKey}`,
      ...this.extraHeaders,
    };
  }

  async complete(
    systemPrompt: string,
    userPrompt: string,
    temperature = 0.7,
    maxTokens = 2048
  ): Promise<AIResponse> {
    console.log(`[AI Companion] OpenRouter request → model: ${this.model}`);

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: this.buildHeaders(),
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature,
        max_tokens: maxTokens,
        stream: false,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const msg =
        (error as { error?: { message?: string } })?.error?.message ??
        `HTTP ${response.status}`;
      const fullError = `OpenRouter API error (HTTP ${response.status}): ${msg}`;
      console.error(`[AI Companion] ${fullError}`, error);
      throw new Error(fullError);
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      usage?: { total_tokens?: number; prompt_tokens?: number; completion_tokens?: number };
      model?: string;
    };

    const text = (data.choices?.[0]?.message?.content ?? "").trim();
    if (!text) throw new Error("OpenRouter returned empty response.");

    return {
      text,
      provider: "openrouter",
      model: data.model ?? this.model,
      tokensUsed: data.usage?.total_tokens,
    };
  }

  async completeStream(
    systemPrompt: string,
    userPrompt: string,
    onChunk: (text: string, totalTokens: number) => void,
    temperature = 0.7,
    maxTokens = 2048
  ): Promise<AIResponse> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: this.buildHeaders(),
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature,
        max_tokens: maxTokens,
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const msg =
        (error as { error?: { message?: string } })?.error?.message ??
        `HTTP ${response.status}`;
      throw new Error(`OpenRouter API error (HTTP ${response.status}): ${msg}`);
    }

    if (!response.body) {
      return this.complete(systemPrompt, userPrompt, temperature, maxTokens);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let fullText = "";
    let usedModel = this.model;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data: ")) continue;
          const json = trimmed.slice(6).trim();
          if (json === "[DONE]") continue;

          try {
            const chunk = JSON.parse(json) as {
              choices?: Array<{ delta?: { content?: string } }>;
              model?: string;
            };
            const text = chunk.choices?.[0]?.delta?.content ?? "";
            if (text) {
              fullText += text;
              onChunk(text, 0);
            }
            if (chunk.model) usedModel = chunk.model;
          } catch {}
        }
      }
    } finally {
      reader.releaseLock();
    }

    return { text: fullText.trim(), provider: "openrouter", model: usedModel };
  }

  async testConnection(): Promise<boolean> {
    if (!this.apiKey?.trim()) throw new Error("OpenRouter API key is empty.");
    const resp = await this.complete("You are a test assistant.", "Reply with: OK", 0, 5);
    return resp.text.toLowerCase().includes("ok");
  }
}
