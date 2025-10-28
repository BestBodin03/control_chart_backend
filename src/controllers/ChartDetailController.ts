import { Response, Request, NextFunction } from "express";
import { chartDetailService } from "../utils/serviceLocator";

export class ChartDetailController {
    async getFilterdDataForCalculate(req: Request, res: Response): Promise<void> {
        try {
            const result = await chartDetailService.calculateIMRChart(req);
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

    async getAllChartDetails(req: Request, res: Response): Promise<void> {
        try {
        const result = await chartDetailService.getAllChartDetails();
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