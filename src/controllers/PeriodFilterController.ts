import { Response, Request, NextFunction } from "express";
import { chartDetailService } from "../utils/serviceLocator";

export class PeriodFilterController {

    async getDynamicFiltering(req: Request, res: Response): Promise<void> {
        try {
        const { data, total, filters, summary } = await chartDetailService.getFilteredData(req);
        res.json({
        status: "success",
        statusCode: 200,
        data,
        total,
        filters,
        summary,
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