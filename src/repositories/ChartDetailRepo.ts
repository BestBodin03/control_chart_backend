import { Model } from "mongoose";
import { ChartDetailData, IChartDetail } from "../models/ChartDetail";

export class ChartDetailRepository {
  constructor(private chartDetailModel: Model<IChartDetail>) {}

  async create(chartDetailData: ChartDetailData): Promise<IChartDetail> {
    const chartDetail = new this.chartDetailModel(chartDetailData);
    return await chartDetail.save();
  }

  async findById(id: string): Promise<IChartDetail | null> {
    return await this.chartDetailModel.findById(id);
  }

  async findByCPNo(cpNo: string): Promise<IChartDetail[]> {
    return await this.chartDetailModel.find({ CPNo: cpNo });
  }

  async findByFGNo(fgNo: string): Promise<IChartDetail[]> {
    return await this.chartDetailModel.find({ FGNo: fgNo });
  }

//   async findAll(): Promise<IChartDetail[]> {
//     return await this.chartDetailModel.find();
//   }

//   async update(id: string, updateData: Partial<ChartDetailData>): Promise<IChartDetail | null> {
//     return await this.chartDetailModel.findByIdAndUpdate(id, updateData, { new: true });
//   }

//   async delete(id: string): Promise<IChartDetail | null> {
//     return await this.chartDetailModel.findByIdAndDelete(id);
//   }
}