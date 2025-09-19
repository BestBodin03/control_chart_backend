// ==================== cronConfig.ts ====================
import { promises as fs } from 'node:fs';
import path from 'node:path';

// Private constants - only used internally
const TIMEZONE = 'Asia/Bangkok';
const SCHEDULE_2AM_DAILY = '0 2 * * *';
const HTTP_TIMEOUT_MS = 30_000;
const LOCK_STALE_MS = 15 * 60 * 1000;

// Private paths
const LOG_DIR = path.resolve(__dirname, '../../log');
const LOG_PATH = path.join(LOG_DIR, 'daily_job.jsonl');
const STATE_PATH = path.join(LOG_DIR, 'last_run.json');
const LOCK_PATH = path.join(LOG_DIR, 'daily_job.lock');

// Private utility functions
async function ensureLogAssets(): Promise<void> {
  await fs.mkdir(LOG_DIR, { recursive: true });
  try { await fs.access(LOG_PATH); } catch { await fs.writeFile(LOG_PATH, '', 'utf8'); }
  try { await fs.access(STATE_PATH); } catch { await fs.writeFile(STATE_PATH, JSON.stringify({ date: null }), 'utf8'); }
}

function todayStrThai(): string {
  return new Date()
    .toLocaleString('sv-SE', { timeZone: TIMEZONE, hour12: false })
    .split(' ')[0];
}

async function logJson(entry: Record<string, unknown>): Promise<void> {
  const line = JSON.stringify({ ts: new Date().toISOString(), ...entry });
  await fs.appendFile(LOG_PATH, line + '\n', 'utf8');
  console.log(line);
}

async function readLastRunDate(): Promise<string | null> {
  try {
    const raw = await fs.readFile(STATE_PATH, 'utf8');
    const obj = JSON.parse(raw) as { date?: string | null };
    return obj.date ?? null;
  } catch {
    return null;
  }
}

async function writeLastRunDate(date: string): Promise<void> {
  await fs.writeFile(STATE_PATH, JSON.stringify({ date }), 'utf8');
}

async function acquireLock(): Promise<boolean> {
  try {
    await fs.writeFile(LOCK_PATH, String(process.pid), { flag: 'wx' });
    return true;
  } catch {
    try {
      const stat = await fs.stat(LOCK_PATH);
      const age = Date.now() - stat.mtimeMs;
      if (age > LOCK_STALE_MS) {
        await logJson({ level: 'warn', event: 'LOCK_STALE', ageMs: age, action: 'force_remove' });
        await fs.unlink(LOCK_PATH).catch(() => {});
        await fs.writeFile(LOCK_PATH, String(process.pid), { flag: 'wx' });
        return true;
      }
    } catch {}
    return false;
  }
}

async function releaseLock(): Promise<void> {
  try { await fs.unlink(LOCK_PATH); } catch {}
}

// Internal API - only export what's needed by other modules in this feature
export const config = {
  TIMEZONE,
  SCHEDULE_2AM_DAILY,
  HTTP_TIMEOUT_MS,
  LOG_PATH,
  STATE_PATH,
  LOCK_PATH,
};

export const utils = {
  ensureLogAssets,
  todayStrThai,
  logJson,
  readLastRunDate,
  writeLastRunDate,
  acquireLock,
  releaseLock,
};