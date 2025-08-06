import { Request, Response } from 'express';
import { ChartDetailService } from '../services/ChartDetailService';
import { CustomerProductService } from '../services/CustomerProductService';
import { FurnaceService } from '../services/FurnaceService';
import { MasterDataService } from '../services/MasterDataService';
import { ICP } from '../models/CustomerProduct';
import { MasterApiRequest } from '../models/MasterApiResponse';

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
  async processFromAPI(req: Request, res: Response, test: MasterApiRequest): Promise<void> {
    try {
      const results = await this.masterDataService.getDataFromQcReport(test);
      
      res.status(201).json({
        status: true,
        message: 'Master data processed successfully',
        data: results,
        summary: {
          furnaceCount: results.furnaces.length,
          customerProductCount: results.customerProducts.length,
          chartDetailCount: results.chartDetails.length,
          processedAt: new Date()
        }
      });
    } catch (error) {
      res.status(500).json({
        status: false,
        message: 'Failed to process master data',
        error: error
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