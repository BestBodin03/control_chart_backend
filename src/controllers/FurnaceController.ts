import { furnaceService } from "../utils/serviceLocator";
import { Request, Response } from 'express';

export class FurnaceController {
  
  async getAllFurnaces(req: Request, res: Response): Promise<void> {
    try {
      const result = await furnaceService.getAllFurnaces();
      res.json({
          status: "success",
          statusCode: res.statusCode,
          data: result
      });
    } catch (e: any) {
        res.json({
            status: "error",
            statusCode: res.statusCode,
            error: {
            message: e.message,
            path: req.originalUrl,
            timeStamp: Date.now()
            }
        });
      }
  }
  
}