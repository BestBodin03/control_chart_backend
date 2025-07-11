import { ChartDetailData, IChartDetail, ChartDetailModel } from "../models/ChartDetail";

export class ChartDetailRepository {
  async bulkCreate(chartDetailData: ChartDetailData[]): Promise<IChartDetail[]> {
    try {
      return await ChartDetailModel.insertMany(chartDetailData, { ordered: false });
    } catch (error: any) {
      // Handle duplicate key errors but continue with unique records
      if (error.code === 11000) {
        console.log('Some chart details already exist, continuing...');
        return error.insertedDocs || [];
      }
      throw error;
    }
  }

  async findExistingFGNos(fgNos: string[]): Promise<string[]> {
    const existing = await ChartDetailModel.find({ FGNo: { $in: fgNos } }, 'FGNo').exec();
    return existing.map(cd => cd.FGNo);
  }

  async findByCPNo(cpNo: string): Promise<IChartDetail[]> {
    return await ChartDetailModel.find({ CPNo: cpNo }).exec();
  }

  async findAll(): Promise<IChartDetail[]> {
    return await ChartDetailModel.find().exec();
  }
}