import { BulkJobStatus } from "./types/bulkJobStatus";

export interface BulkJobProgress {
  jobId: string;
  status: BulkJobStatus;
  startedAt?: number;
  finishedAt?: number;
  total: number;
  completed: number;
  success: number;
  failed: number;
  percent: number;
  lastItem?: string;
  errors?: Array<{ item: string; message: string }>;
}