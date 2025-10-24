export interface OpenAIConfig {
  baseUrl: string;
  apiKey: string;
  model: string;
  timeout: number;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface StreamChunk {
  choices: Array<{
    delta: {
      content?: string;
    };
    finish_reason?: string | null;
  }>;
}

export class OpenAIClient {
  private config: OpenAIConfig;
  private filterThinkTags: boolean;

  constructor(config: OpenAIConfig, filterThinkTags: boolean = true) {
    this.config = config;
    this.filterThinkTags = filterThinkTags;
  }

  private removeThinkTags(text: string): string {
    if (!this.filterThinkTags) return text;
    return text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  }

  async chatCompletion(messages: ChatMessage[], streaming: boolean = false): Promise<string> {
    if (streaming) {
      return this.streamingRequest(messages);
    } else {
      return this.nonStreamingRequest(messages);
    }
  }

  private async nonStreamingRequest(messages: ChatMessage[]): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout * 1000);

    try {
      const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          model: this.config.model,
          messages,
          stream: false
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      return this.removeThinkTags(content);
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error(`Request timeout after ${this.config.timeout} seconds`);
        }
        throw error;
      }
      throw new Error('Unknown error occurred');
    }
  }

  private async streamingRequest(messages: ChatMessage[]): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout * 1000);

    try {
      const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          model: this.config.model,
          messages,
          stream: true
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      return await this.parseStreamResponse(response.body);
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error(`Request timeout after ${this.config.timeout} seconds`);
        }
        throw error;
      }
      throw new Error('Unknown error occurred');
    }
  }

  private async parseStreamResponse(stream: ReadableStream<Uint8Array>): Promise<string> {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let result = '';
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');

        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine || trimmedLine === 'data: [DONE]') continue;

          if (trimmedLine.startsWith('data: ')) {
            try {
              const jsonStr = trimmedLine.slice(6);
              const parsed: StreamChunk = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content;

              if (content) {
                result += content;
              }

              if (parsed.choices?.[0]?.finish_reason) {
                break;
              }
            } catch (parseError) {
              console.warn('Failed to parse SSE line:', trimmedLine, parseError);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    return this.removeThinkTags(result);
  }

  replacePromptVariables(template: string, rowData: Record<string, string>): string {
    let prompt = template;

    for (const [key, value] of Object.entries(rowData)) {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      prompt = prompt.replace(regex, value);
    }

    return prompt;
  }
}

export const createOpenAIClient = (config: OpenAIConfig, filterThinkTags: boolean = true): OpenAIClient => {
  return new OpenAIClient(config, filterThinkTags);
};
