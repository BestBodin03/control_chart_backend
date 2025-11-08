import { Request, Response } from 'express';
import { MasterDataService } from '../services/masterDataService';
import { furnaceCacheController } from './furnaceCacheController';
import { furnaceMaterialCacheService } from '../services/furnaceMaterialCacheService';
import { MasterApiRequest } from '../models/masterApiResponse';
import { autoCompleteEndDate } from '../utils/masterDataLotEncoder';

export class MasterDataController {
  constructor(
    private masterDataService: MasterDataService
  ) {}

  async fetchDataFromQcReport(req: Request, res: Response): Promise<void> {
    try {
      const masterApiRequest: MasterApiRequest = req.body;
      
      const result = await this.masterDataService.getDataFromQcReport(masterApiRequest);

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

  async processFromAPI(req: Request, res: Response): Promise<any> {
    try {
      
      const endDates = autoCompleteEndDate(
        req.body.ENDyear,
        req.body.ENDmonth,
        req.body.ENDday
      );
      
      const masterReq: MasterApiRequest = {
        DB: req.body.DB || "",
        MATCP: req.body.MATCP || "",
        STARTyear: req.body.STARTyear || "2025",
        STARTmonth: req.body.STARTmonth || "01",
        STARTday: req.body.STARTday || "01",
        ...endDates
      };
      const result = await this.masterDataService.processFromAPI(masterReq);
      await furnaceMaterialCacheService.refresh();
      
      return res.json({
        status: "success",
        statusCode: res.statusCode,
        summary: {
          furnaces: result.furnaces.length,
          customerProducts: result.customerProducts.length,
          chartDetails: result.chartDetails.length
        },
        data: result
      });
      
    } catch 
    (e: any) {
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

  async getDataFromQcReport(req: Request, res: Response): Promise<void> {
    try {
      await this.masterDataService.getDataFromQcReport(req.body);

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