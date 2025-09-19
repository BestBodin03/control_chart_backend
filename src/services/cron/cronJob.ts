// ==================== scheduler.ts ====================
import { CronJob } from 'cron';
import { config, utils } from './cronConfig';
import { maybeRunToday } from './executor';

let started = false;

// Public API - Main entry point
export async function startDailyJobScheduler(): Promise<void> {
  if (started) return;
  started = true;

  await utils.ensureLogAssets();
  await utils.logJson({
    level: 'info',
    event: 'CRON_REGISTERED',
    schedule: config.SCHEDULE_2AM_DAILY,
    tz: config.TIMEZONE,
    paths: { 
      LOG_FILE: config.LOG_PATH, 
      STATE_PATH: config.STATE_PATH, 
      LOCK_PATH: config.LOCK_PATH 
    },
  });

  // Schedule: 02:00 daily (Thai time)
  new CronJob(
    config.SCHEDULE_2AM_DAILY,
    () => { void maybeRunToday(); },
    null,
    true,
    config.TIMEZONE
  );

  // Graceful cleanup
  const graceful = async (signal: string, code = 0) => {
    await utils.logJson({ level: 'warn', event: 'PROC_EXIT', signal });
    await utils.releaseLock();
    process.exit(code);
  };

  process.on('SIGINT', () => { void graceful('SIGINT'); });
  process.on('SIGTERM', () => { void graceful('SIGTERM'); });
  process.on('uncaughtException', async (e) => { console.error(e); await graceful('uncaughtException', 1); });
  process.on('unhandledRejection', async (r) => { console.error(r); await graceful('unhandledRejection', 1); });
}