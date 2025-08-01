import { Request, Response } from 'express';
import { ChartDetailService } from '../services/ChartDetailService';
import { CustomerProductService } from '../services/CustomerProductService';
import { FurnaceService } from '../services/FurnaceService';
import { MasterDataService } from '../services/MasterDataService';
import { ICP } from '../models/CustomerProduct';

// ✅ Master Data Controller
export class MasterDataController {
  constructor(
    private masterDataService: MasterDataService,
    private furnaceService: FurnaceService,
    private customerProductService: CustomerProductService,
    private chartDetailService: ChartDetailService
  ) {}

  // Process from API
  async processFromAPI(req: Request, res: Response): Promise<void> {
    try {
      const results = await this.masterDataService.processFromAPI();
      
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
}