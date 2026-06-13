// ─── OpenAI Provider ──────────────────────────────────────────────────────────
import type { AIResponse } from "./GeminiProvider";

export class OpenAIProvider {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string) {
    this.apiKey = apiKey;
    this.model = model;
  }

  async complete(
    systemPrompt: string,
    userPrompt: string,
    temperature = 0.7,
    maxTokens = 2048
  ): Promise<AIResponse> {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
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
      throw new Error(`OpenAI API error (HTTP ${response.status}): ${msg}`);
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      usage?: { total_tokens?: number };
    };

    return {
      text: (data.choices?.[0]?.message?.content ?? "").trim(),
      provider: "openai",
      model: this.model,
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
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
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
      throw new Error(`OpenAI API error (HTTP ${response.status}): ${msg}`);
    }

    if (!response.body) {
      return this.complete(systemPrompt, userPrompt, temperature, maxTokens);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let fullText = "";

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
            };
            const text = chunk.choices?.[0]?.delta?.content ?? "";
            if (text) {
              fullText += text;
              onChunk(text, 0);
            }
          } catch {}
        }
      }
    } finally {
      reader.releaseLock();
    }

    return { text: fullText.trim(), provider: "openai", model: this.model };
  }

  async testConnection(): Promise<boolean> {
    if (!this.apiKey?.trim()) throw new Error("OpenAI API key is empty.");
    const resp = await this.complete("You are a test assistant.", "Reply: OK", 0, 5);
    return resp.text.toLowerCase().includes("ok");
  }
}
