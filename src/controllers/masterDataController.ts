import { Request, Response } from 'express';
import { ChartDetailService } from '../services/ChartDetailService';
import { CustomerProductService } from '../services/CustomerProductService';
import { FurnaceService } from '../services/FurnaceService';
import { MasterDataService } from '../services/MasterDataService';
import { ICP } from '../models/CustomerProduct';
import { MasterApiRequest } from '../models/MasterApiResponse';
import { autoCompleteEndDate } from '../utils/masterDataFGEncoder';

// ✅ Master Data Controller
export class MasterDataController {
  constructor(
    private masterDataService: MasterDataService,
    private furnaceService: FurnaceService,
    private customerProductService: CustomerProductService,
    private chartDetailService: ChartDetailService,
  ) {}

  async fetchDataFromQcReport(req: Request, res: Response): Promise<void> {
        try {
          const masterApiRequest: MasterApiRequest = req.body;
          
          const result = await this.masterDataService.getDataFromQcReport(masterApiRequest);
          
          res.status(200).json({
            success: true,
            data: result
          });
        } catch (error: any) {
          res.status(400).json({
            success: false,
            message: error.message || 'Failed to get data from QC Report'
          });
        }
  }

  // Process from API
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

      // This will call getDataFromQcReport internally and then process to database
      const result = await this.masterDataService.processFromAPI(masterReq);
      
      if (res.headersSent) return;
      
      return res.json({
        status: "success",
        message: "Data processed and saved to database successfully",
        summary: {
          furnaces: result.furnaces.length,
          customerProducts: result.customerProducts.length,
          chartDetails: result.chartDetails.length
        },
        data: result
      });
      
    } catch (error) {
      console.error('Router error:', error);
      
      if (res.headersSent) return;
      
      // Handle specific itemCode errors gracefully
      if (error instanceof Error && error.message.includes('No itemCode found')) {
        return res.status(400).json({ 
          status: "error",
          message: 'Item mapping error - data processing stopped',
          error: error.message,
          suggestion: 'Please check if the item name exists in your mapping configuration'
        });
      }
      
      return res.status(500).json({ 
        status: "error",
        message: 'Failed to process master data',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getAllFurnaces(req: Request, res: Response): Promise<void> {
    try {
      let qcReportRequest: MasterApiRequest = req.body;
      const furnaces = await this.furnaceService.getAllFurnaces();
      res.status(200).json({
        status: "success",
        data: furnaces
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        data: [],
        message: error
      });
    }
  }

async getCustomerProducts(req: Request, res: Response): Promise<void> {
    try {
      const items = await this.customerProductService.getAllCustomerProducts();
      
      res.status(200).json({
        status: "success",
        data: items
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        data: [],
        message: error
      });
    }
  }

  // Get all chart details
  async getAllChartDetails(req: Request, res: Response): Promise<void> {
    try {
      const chartDetails = await this.chartDetailService.getAllChartDetails();
      res.status(200).json({
        status: "success",
        data: chartDetails
      });
    } catch (error) {
      res.json({
        status: res.statusCode,
        data: [],
        error: error
      });
    }
  }

  async getDataFromQcReport(req: Request, res: Response): Promise<void> {
    const test = await this.masterDataService.getDataFromQcReport(req.body);
    console.log(test);
  }
}