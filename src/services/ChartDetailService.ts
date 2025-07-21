import { ChartDetailData, IChartDetail } from "../models/ChartDetail";
import { IChartDetailsFiltering, FilteredResult } from "../models/ChartDetailFiltering";
import { ChartDetailRepository } from "../repositories/ChartDetailRepo";
import { Router, Request, Response } from "express";

// ✅ Chart Detail Service
export class ChartDetailService {
  constructor(private chartDetailRepository: ChartDetailRepository) {}

  async bulkCreateUniqueChartDetails(chartDetailDataArray: ChartDetailData[]): Promise<IChartDetail[]> {
    // Extract unique FG numbers
    const uniqueFGNos = [...new Set(chartDetailDataArray.map(cd => cd.FGNo))];
    console.log(`Unique FG numbers to process: ${uniqueFGNos.length}`);
    
    // Check existing chart details
    const existingFGNos = await this.chartDetailRepository.findExistingFGNos(uniqueFGNos);
    const existingSet = new Set(existingFGNos);
    
    // Filter new chart details only
    const newChartDetailData = chartDetailDataArray.filter(cd => !existingSet.has(cd.FGNo));
    const uniqueNewChartDetailData = newChartDetailData.filter((cd, index, arr) => 
      arr.findIndex(item => item.FGNo === cd.FGNo) === index
    );
    
    console.log(`New chart details to insert: ${uniqueNewChartDetailData.length}`);
    
    if (uniqueNewChartDetailData.length > 0) {
      return await this.chartDetailRepository.bulkCreate(uniqueNewChartDetailData);
    }
    
    return [];
  }

  async getAllChartDetails(): Promise<IChartDetail[]> {
    return await this.chartDetailRepository.findAll();
  }

  async handleDynamicFiltering(filters?: IChartDetailsFiltering): Promise<FilteredResult<IChartDetail>> {
    // Get all data from repository
    const allData = await this.chartDetailRepository.findAll();
    
    // If no filters provided, return all data
    if (!filters) {
      return {
        data: allData,
        total: allData.length,
        filters: filters || {} as IChartDetailsFiltering
      };
    }

    // Apply filters
    let filteredData = [...allData];

    // Filter by period
    if (filters.period) {
      filteredData = this.filterByPeriod(filteredData, filters.period);
    }

    // Filter by furnaceNo
    if (filters.furnaceNo !== undefined) {
      filteredData = filteredData.filter(item => item.chartGeneralDetail.furnaceNo === filters.furnaceNo);
    }

    // Filter by matNo
    if (filters.matNo) {
      filteredData = filteredData.filter(item => item.CPNo === filters.matNo);
    }

    return {
      data: filteredData,
      total: filteredData.length,
      filters
    };
  }

  private filterByPeriod(data: IChartDetail[], period: any): IChartDetail[] {
    // Implement period filtering logic based on your IPeriodFilter interface
    // This is a placeholder - adjust based on your actual period filter structure
    return data.filter(item => {
      // Add your period filtering logic here
      // Example: item.date >= period.startDate && item.date <= period.endDate
      return true;
    });
  }
}