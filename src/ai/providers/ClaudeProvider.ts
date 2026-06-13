// ─── Anthropic Claude Provider ────────────────────────────────────────────────
import type { AIResponse } from "./GeminiProvider";

export class ClaudeProvider {
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
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: this.model,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
        max_tokens: maxTokens,
        temperature,
        stream: false,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const msg =
        (error as { error?: { message?: string } })?.error?.message ??
        `HTTP ${response.status}`;
      throw new Error(`Claude API error (HTTP ${response.status}): ${msg}`);
    }

    const data = (await response.json()) as {
      content?: Array<{ type: string; text?: string }>;
      usage?: { input_tokens?: number; output_tokens?: number };
    };

    const text =
      data.content
        ?.filter((b) => b.type === "text")
        .map((b) => b.text ?? "")
        .join("") ?? "";

    return {
      text: text.trim(),
      provider: "claude",
      model: this.model,
      tokensUsed: (data.usage?.input_tokens ?? 0) + (data.usage?.output_tokens ?? 0),
    };
  }

  async completeStream(
    systemPrompt: string,
    userPrompt: string,
    onChunk: (text: string, totalTokens: number) => void,
    temperature = 0.7,
    maxTokens = 2048
  ): Promise<AIResponse> {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: this.model,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
        max_tokens: maxTokens,
        temperature,
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const msg =
        (error as { error?: { message?: string } })?.error?.message ??
        `HTTP ${response.status}`;
      throw new Error(`Claude API error (HTTP ${response.status}): ${msg}`);
    }

    if (!response.body) {
      return this.complete(systemPrompt, userPrompt, temperature, maxTokens);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let fullText = "";
    let totalTokens = 0;

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

          try {
            const event = JSON.parse(json) as {
              type?: string;
              delta?: { type?: string; text?: string };
              usage?: { output_tokens?: number };
              message?: { usage?: { input_tokens?: number; output_tokens?: number } };
            };

            if (event.type === "content_block_delta" && event.delta?.type === "text_delta") {
              const text = event.delta.text ?? "";
              if (text) {
                fullText += text;
                onChunk(text, totalTokens);
              }
            } else if (event.type === "message_delta" && event.usage?.output_tokens) {
              totalTokens += event.usage.output_tokens;
            } else if (event.type === "message_start" && event.message?.usage) {
              totalTokens += event.message.usage.input_tokens ?? 0;
            }
          } catch {}
        }
      }
    } finally {
      reader.releaseLock();
    }

    return { text: fullText.trim(), provider: "claude", model: this.model, tokensUsed: totalTokens };
  }

  async testConnection(): Promise<boolean> {
    if (!this.apiKey?.trim()) throw new Error("Claude API key is empty.");
    const resp = await this.complete("You are a test assistant.", "Reply: OK", 0, 10);
    return resp.text.toLowerCase().includes("ok");
  }
}
