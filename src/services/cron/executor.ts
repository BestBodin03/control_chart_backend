// ==================== executor.ts ====================
import axios from 'axios';
import { furnaceMaterialCacheService } from '../furnaceMaterialCacheService';
import { config, utils } from './cronConfig';

// Private service function
async function callService(cpNo: string) {
  const url = process.env.CURRENT_DATA_API ?? '';
  const body = { MATCP: cpNo };
  const res = await axios.post(url, body, { timeout: config.HTTP_TIMEOUT_MS });
  return res.data;
}

// Private job execution
async function runDailyJob(): Promise<void> {
  const jobId = Date.now();
  const src = furnaceMaterialCacheService.getAll() as any;
  const list: string[] = Array.isArray(src) ? src : Array.isArray(src?.cpNo) ? src.cpNo : [];

  await utils.logJson({ level: 'info', event: 'JOB_START', jobId, items: list.length });
  if (list.length === 0) {
    await utils.logJson({ level: 'warn', event: 'NO_TARGETS', jobId });
  }

  let ok = 0, fail = 0;
  for (const cpNo of list) {
    const started = Date.now();
    await utils.logJson({ level: 'debug', event: 'ITEM_BEGIN', jobId, cpNo });
    try {
      await callService(cpNo);
      ok++;
      await utils.logJson({ level: 'info', event: 'ITEM_OK', jobId, cpNo, ms: Date.now() - started });
    } catch (e: any) {
      fail++;
      await utils.logJson({
        level: 'error',
        event: 'ITEM_FAIL',
        jobId,
        cpNo,
        error: e?.message ?? String(e),
        ms: Date.now() - started,
      });
    }
  }
  await utils.logJson({ level: 'info', event: 'JOB_DONE', jobId, success: ok, fail });
}

// Internal API - policy: once per Thai day (date+lock)
export async function maybeRunToday(): Promise<void> {
  const today = utils.todayStrThai();
  const last = await utils.readLastRunDate();
  if (last === today) {
    await utils.logJson({ level: 'info', event: 'JOB_SKIP', reason: 'already_ran_today', today });
    return;
  }

  const locked = await utils.acquireLock();
  if (!locked) {
    await utils.logJson({ level: 'warn', event: 'JOB_SKIP', reason: 'locked' });
    return;
  }

  try {
    await runDailyJob();
    await utils.writeLastRunDate(today);
  } finally {
    await utils.releaseLock();
  }
}

// Development/testing utility
export async function runDailyJobNow(): Promise<void> {
  await utils.ensureLogAssets();
  await runDailyJob();
}
