// ─── Gemini Provider ──────────────────────────────────────────────────────────

export interface AIResponse {
  text: string;
  provider: string;
  model: string;
  tokensUsed?: number;
}

export class GeminiProvider {
  private apiKey: string;
  private model: string;
  private baseUrl = "https://generativelanguage.googleapis.com/v1beta";

  constructor(apiKey: string, model: string) {
    this.apiKey = apiKey;
    this.model = model;
  }

  // ── Non-streaming (full response) ─────────────────────────────────────────
  async complete(
    systemPrompt: string,
    userPrompt: string,
    temperature = 0.7,
    maxTokens = 2048
  ): Promise<AIResponse> {
    const url = `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`;
    console.log(`[AI Companion] Gemini request → model: ${this.model}`);

    const body = {
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      generationConfig: { temperature, maxOutputTokens: maxTokens, candidateCount: 1 },
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const msg =
        (error as { error?: { message?: string } })?.error?.message ??
        `HTTP ${response.status}`;
      const fullError = `Gemini API error (HTTP ${response.status}): ${msg}`;
      console.error(`[AI Companion] ${fullError}`, error);
      throw new Error(fullError);
    }

    const data = (await response.json()) as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
        finishReason?: string;
      }>;
      usageMetadata?: { totalTokenCount?: number };
    };

    const text =
      data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";

    if (!text) {
      const reason = data.candidates?.[0]?.finishReason ?? "UNKNOWN";
      throw new Error(`Gemini returned empty response. Finish reason: ${reason}`);
    }

    return {
      text: text.trim(),
      provider: "gemini",
      model: this.model,
      tokensUsed: data.usageMetadata?.totalTokenCount,
    };
  }

  // ── Streaming via SSE ─────────────────────────────────────────────────────
  async completeStream(
    systemPrompt: string,
    userPrompt: string,
    onChunk: (text: string, totalTokens: number) => void,
    temperature = 0.7,
    maxTokens = 2048
  ): Promise<AIResponse> {
    const url = `${this.baseUrl}/models/${this.model}:streamGenerateContent?key=${this.apiKey}&alt=sse`;
    console.log(`[AI Companion] Gemini streaming → model: ${this.model}`);

    const body = {
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      generationConfig: { temperature, maxOutputTokens: maxTokens, candidateCount: 1 },
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const msg =
        (error as { error?: { message?: string } })?.error?.message ??
        `HTTP ${response.status}`;
      const fullError = `Gemini API error (HTTP ${response.status}): ${msg}`;
      console.error(`[AI Companion] ${fullError}`, error);
      throw new Error(fullError);
    }

    if (!response.body) {
      // Fallback to non-streaming
      console.warn("[AI Companion] ReadableStream not available, falling back to complete()");
      const resp = await this.complete(systemPrompt, userPrompt, temperature, maxTokens);
      onChunk(resp.text, resp.tokensUsed ?? 0);
      return resp;
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
          if (!json || json === "[DONE]") continue;

          try {
            const chunk = JSON.parse(json) as {
              candidates?: Array<{
                content?: { parts?: Array<{ text?: string }> };
                finishReason?: string;
              }>;
              usageMetadata?: { totalTokenCount?: number };
            };

            const chunkText =
              chunk.candidates?.[0]?.content?.parts
                ?.map((p) => p.text ?? "")
                .join("") ?? "";

            if (chunkText) {
              fullText += chunkText;
              totalTokens = chunk.usageMetadata?.totalTokenCount ?? totalTokens;
              onChunk(chunkText, totalTokens);
            }
          } catch (e) {
            console.warn("[AI Companion] Failed to parse SSE chunk:", json, e);
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    if (!fullText) {
      throw new Error("Gemini streaming returned empty response.");
    }

    return { text: fullText.trim(), provider: "gemini", model: this.model, tokensUsed: totalTokens };
  }

  async testConnection(): Promise<boolean> {
    if (!this.apiKey || this.apiKey.trim() === "") {
      throw new Error("API key is empty. Enter your key in Settings → AI Companion.");
    }
    const resp = await this.complete(
      "You are a test assistant.",
      "Reply with just: OK",
      0,
      10
    );
    return resp.text.toLowerCase().includes("ok");
  }
}
