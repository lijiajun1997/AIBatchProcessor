import { OpenAIClient, createOpenAIClient } from './openaiClient';
import { spreadsheetService, SpreadsheetRow, TaskConfig } from './database';

export interface ProcessingStats {
  total: number;
  completed: number;
  failed: number;
  processing: number;
  queued: number;
}

export type ProcessingCallback = (stats: ProcessingStats) => void;

export class BatchProcessor {
  private client: OpenAIClient;
  private config: TaskConfig;
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private activeRequests: Set<Promise<void>> = new Set();
  private onStatsUpdate?: ProcessingCallback;

  constructor(config: TaskConfig, onStatsUpdate?: ProcessingCallback) {
    this.config = config;
    this.onStatsUpdate = onStatsUpdate;
    this.client = createOpenAIClient({
      baseUrl: config.base_url,
      apiKey: config.api_key,
      model: config.model_name,
      timeout: config.timeout_seconds
    }, config.filter_think_tags);
  }

  async processRows(rows: SpreadsheetRow[], count?: number): Promise<void> {
    if (this.isRunning) {
      throw new Error('Batch processing is already running');
    }

    this.isRunning = true;
    this.isPaused = false;

    const pendingRows = rows.filter(row => row.status === 'pending' || row.status === 'failed');
    const rowsToProcess = count ? pendingRows.slice(0, count) : pendingRows;

    if (rowsToProcess.length === 0) {
      this.isRunning = false;
      return;
    }

    const queue = [...rowsToProcess];
    const processing: Set<string> = new Set();

    const updateStats = () => {
      if (this.onStatsUpdate) {
        const stats: ProcessingStats = {
          total: rows.length,
          completed: rows.filter(r => r.status === 'completed').length,
          failed: rows.filter(r => r.status === 'failed').length,
          processing: processing.size,
          queued: queue.length
        };
        this.onStatsUpdate(stats);
      }
    };

    const processNext = async (): Promise<void> => {
      while (this.isRunning && !this.isPaused && queue.length > 0) {
        if (processing.size >= this.config.concurrency) {
          await new Promise(resolve => setTimeout(resolve, 100));
          continue;
        }

        const row = queue.shift();
        if (!row) continue;

        processing.add(row.id);
        updateStats();

        const promise = this.processRow(row)
          .finally(() => {
            processing.delete(row.id);
            updateStats();
          });

        this.activeRequests.add(promise);
        promise.finally(() => this.activeRequests.delete(promise));
      }
    };

    updateStats();

    const workers = Array(this.config.concurrency)
      .fill(null)
      .map(() => processNext());

    await Promise.all(workers);

    await Promise.all(Array.from(this.activeRequests));

    this.isRunning = false;
    updateStats();
  }

  private async processRow(row: SpreadsheetRow): Promise<void> {
    let attempts = 0;
    const maxAttempts = this.config.retry_count + 1;

    while (attempts < maxAttempts && this.isRunning && !this.isPaused) {
      try {
        await spreadsheetService.updateRow(row.id, {
          status: 'processing',
          error_message: ''
        });

        row.status = 'processing';

        const prompt = this.client.replacePromptVariables(
          this.config.prompt_template,
          row.columns
        );

        const result = await this.client.chatCompletion(
          [{ role: 'user', content: prompt }],
          this.config.is_streaming
        );

        await spreadsheetService.updateRow(row.id, {
          result,
          status: 'completed',
          error_message: ''
        });

        row.result = result;
        row.status = 'completed';
        row.error_message = '';

        return;
      } catch (error) {
        attempts++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        if (attempts >= maxAttempts) {
          await spreadsheetService.updateRow(row.id, {
            status: 'failed',
            error_message: errorMessage
          });

          row.status = 'failed';
          row.error_message = errorMessage;
        } else {
          await new Promise(resolve =>
            setTimeout(resolve, Math.min(1000 * Math.pow(2, attempts - 1), 10000))
          );
        }
      }
    }
  }

  pause(): void {
    this.isPaused = true;
  }

  resume(): void {
    this.isPaused = false;
  }

  async cancel(): Promise<void> {
    this.isRunning = false;
    this.isPaused = false;
    await Promise.all(Array.from(this.activeRequests));
  }

  isProcessing(): boolean {
    return this.isRunning;
  }

  isPausedState(): boolean {
    return this.isPaused;
  }
}
