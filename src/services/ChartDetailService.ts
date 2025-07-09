import { Types } from "mongoose";
import { ChartDetailData, IChartDetail } from "../models/ChartDetail";
import { ChartDetailRepository } from "../repositories/ChartDetailRepo";

export class ChartDetailService {
  constructor(private chartDetailRepository: ChartDetailRepository) {}

  async createChartDetail(chartDetailData: ChartDetailData): Promise<IChartDetail> {
    return await this.chartDetailRepository.create(chartDetailData);
  }

  async getChartDetailById(id: string): Promise<IChartDetail | null> {
    if (!Types.ObjectId.isValid(id)) {
      throw new Error('Invalid chart detail ID');
    }
    return await this.chartDetailRepository.findById(id);
  }

  async getChartDetailsByCPNo(cpNo: string): Promise<IChartDetail[]> {
    return await this.chartDetailRepository.findByCPNo(cpNo);
  }

  async getChartDetailsByFGNo(fgNo: string): Promise<IChartDetail[]> {
    return await this.chartDetailRepository.findByFGNo(fgNo);
  }
  
}