import axios from "axios";
import { furnaceMaterialCacheService } from "./furnaceMaterialCacheService";
import { BulkJobProgress } from "../models/bulkJobProgress";

export class CurrentChartDetailService {
  private state: BulkJobProgress = {
    jobId: '',
    status: 'idle',
    total: 0,
    completed: 0,
    success: 0,
    failed: 0,
    percent: 0,
  };
  private running = false;
  private abort = false;

  /** Get current job progress */
  get progress(): BulkJobProgress {
    return { ...this.state };
  }

  /** Start the process (loop cpNo cache) */
  async start(): Promise<BulkJobProgress> {
    if (this.running) return this.progress;

    const src = furnaceMaterialCacheService.getAll();
    const list: string[] = src['cpNo'];

    const jobId = Date.now().toString();
    this.state = {
      jobId,
      status: 'running',
      startedAt: Date.now(),
      finishedAt: undefined,
      total: list.length,
      completed: 0,
      success: 0,
      failed: 0,
      percent: 0,
      lastItem: undefined,
      errors: [],
    };
    this.running = true;
    this.abort = false;

    try {
      for (const item of list) {
        if (this.abort) break;

        this.state.lastItem = item;
        try {
          await this.callService(item);
          this.state.success += 1;
        } catch (e: any) {
          this.state.failed += 1;
          this.state.errors!.push({ item, message: e?.message ?? String(e) });
        } finally {
          this.state.completed += 1;
          this.state.percent =
            this.state.total === 0
              ? 100
              : Math.floor((this.state.completed / this.state.total) * 100);
        }
      }

      this.state.status = this.abort ? 'cancelled' : 'done';
      this.state.finishedAt = Date.now();
      return this.progress;
    } catch (e) {
      this.state.status = 'error';
      this.state.finishedAt = Date.now();
      this.state.errors!.push({
        item: this.state.lastItem ?? '-',
        message: (e as any)?.message ?? String(e),
      });
      return this.progress;
    } finally {
      this.running = false;
      this.abort = false;
    }
  }

  /** Cancel current job */
  cancel() {
    if (!this.running) return;
    this.abort = true;
  }

  /** Call external API */
  private async callService(cpNo: string) {
    const url = process.env.CURRENT_DATA_API ?? '';
    const body = { MATCP: cpNo };
    await axios.post(url, body, { timeout: 30000 });
  }
}

// singleton instance (like before)
export const currentChartDetailService = new CurrentChartDetailService();
