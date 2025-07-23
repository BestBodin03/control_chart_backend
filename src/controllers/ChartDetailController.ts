import { Response, Request, NextFunction } from "express";
import { ChartDetailModel } from "../models/ChartDetail";
import { DataPartitionwithPeriod } from "../utils/dataPartitionwithPeriod";
import { SettingModel } from "../models/Setting";
import { chartDetailController, chartDetailService, periodFilterController } from "../utils/serviceLocator";
import { IChartDetailsFiltering } from "../models/ChartDetailFiltering";

export class ChartDetailController {
    async getFilterdDataForCalculate(req: Request, res: Response): Promise<void> {
        try {
            const result = await chartDetailService.calculateIMRChart(req);
            res.json(result);
        } catch (error) {
            console.error('❌ Error in fetching Data for Calculating:', error);
            res.status(500).json({ error: 'Failed to get filtered data for calculation' });
        }
    }
}