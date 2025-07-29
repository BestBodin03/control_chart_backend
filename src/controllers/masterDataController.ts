import { Request, Response } from 'express';
import { ChartDetailService } from '../services/ChartDetailService';
import { CustomerProductService } from '../services/CustomerProductService';
import { FurnaceService } from '../services/FurnaceService';
import { MasterDataService } from '../services/MasterDataService';

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

  // Get all furnaces
  async getAllFurnaces(req: Request, res: Response): Promise<void> {
    try {
      const furnaces = await this.furnaceService.getAllFurnaces();
      res.json({
        status: true,
        data: furnaces,
        count: furnaces.length
      });
    } catch (error) {
      res.status(500).json({
        status: false,
        message: 'Failed to get furnaces',
        error: error
      });
    }
  }

  // Get all customer products
  async getAllCustomerProducts(req: Request, res: Response): Promise<void> {
    try {
      const customerProducts = await this.customerProductService.getAllCustomerProducts();
      res.json({
        status: true,
        data: customerProducts,
        count: customerProducts.length
      });
    } catch (error) {
      res.status(500).json({
        status: false,
        message: 'Failed to get customer products',
        error: error
      });
    }
  }

  // Get all chart details
  async getAllChartDetails(req: Request, res: Response): Promise<void> {
    try {
      const chartDetails = await this.chartDetailService.getAllChartDetails();
      res.json({ chartDetails});
    } catch (error) {
      res.status(500).json({
        message: 'Failed to get chart details',
        error: error
      });
    }
  }
}