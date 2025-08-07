import { ChartDetailData, IChartDetail, ChartDetailModel } from "../models/ChartDetail";

export class ChartDetailRepository {
  async bulkCreate(data: ChartDetailData[]): Promise<IChartDetail[]> {
    const ops = data.map(item => ({
      updateOne: {
        filter: { FGNo: item.FGNo },
        update: { $set: item },
        upsert: true
      }
    }));
    
    await ChartDetailModel.bulkWrite(ops);
    
    const fgNumbers = data.map(d => d.FGNo);
    return ChartDetailModel.find({ FGNo: { $in: fgNumbers } }).lean() as unknown as Promise<IChartDetail[]>;
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