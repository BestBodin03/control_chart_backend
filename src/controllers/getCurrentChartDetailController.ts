import { Request, Response } from 'express';
import { currentChartDetailService } from '../services/currentChartDetaillService';

export class GetCurrentChartDetailController {
  async getCurrentChartDetail(_req: Request, res: Response): Promise<any> {
    try {
      const progress = await currentChartDetailService.start();
      return res.json({
        status: 'success',
        statusCode: res.statusCode,
        data: progress, // includes: jobId, status, total, completed, percent, etc.
      });
    } catch (e: any) {
      return res.status(500).json({
        status: 'error',
        statusCode: res.statusCode,
        error: {
          message: e?.message ?? String(e),
          path: _req.originalUrl,
          timeStamp: Date.now(),
        },
      });
    }
  }

  /** Return current progress snapshot */
  async getProgress(_req: Request, res: Response): Promise<any> {
    try {
      const progress = currentChartDetailService.progress;
      return res.json({
        status: 'success',
        statusCode: res.statusCode,
        data: progress,
      });
    } catch (e: any) {
      return res.status(500).json({
        status: 'error',
        statusCode: res.statusCode,
        error: {
          message: e?.message ?? String(e),
          path: _req.originalUrl,
          timeStamp: Date.now(),
        },
      });
    }
  }

  /** Cancel current job (if any) */
  async cancel(_req: Request, res: Response): Promise<any> {
    try {
      currentChartDetailService.cancel();
      return res.json({
        status: 'success',
        statusCode: res.statusCode,
        data: { message: 'Cancelling if running' },
      });
    } catch (e: any) {
      return res.status(500).json({
        status: 'error',
        statusCode: res.statusCode,
        error: {
          message: e?.message ?? String(e),
          path: _req.originalUrl,
          timeStamp: Date.now(),
        },
      });
    }
  }
}
