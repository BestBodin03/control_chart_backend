import { ChartDetailData, ChartDetail, ChartDetailModel } from "../models/entities/chartDetail";

export class ChartDetailRepository {
  async bulkCreate(data: ChartDetailData[]): Promise<ChartDetail[]> {
    const ops = data.map(item => ({
      updateOne: {
        filter: { FGNo: item.FGNo },
        update: { $set: item },
        upsert: true
      }
    }));
    
    await ChartDetailModel.bulkWrite(ops);
    
    const fgNumbers = data.map(d => d.FGNo);
    return ChartDetailModel.find({ FGNo: { $in: fgNumbers } }).lean() as unknown as Promise<ChartDetail[]>;
  }

  async bulkUpdate(data: ChartDetailData[]): Promise<ChartDetail[]> {
    const ops = data.map(item => ({
      updateOne: {
        filter: { FGNo: item.FGNo },
        update: { $set: item },
        upsert: true
      }
    }));
    
    await ChartDetailModel.bulkWrite(ops);
    
    const fgNumbers = data.map(d => d.FGNo);
    return ChartDetailModel.find({ FGNo: { $in: fgNumbers } }).lean() as unknown as Promise<ChartDetail[]>;
  }

  // In ChartDetailRepository
  async findByFGNos(fgNos: string[]): Promise<ChartDetail[]> {
    return ChartDetailModel.find({ 
      FGNo: { $in: fgNos } 
    }).lean() as unknown as Promise<ChartDetail[]>;
  }

  async findExistingFGNos(fgNos: string[]): Promise<string[]> {
    const existing = await ChartDetailModel.find({ FGNo: { $in: fgNos } }, 'FGNo').exec();
    return existing.map(cd => cd.FGNo);
  }

  async findByCPNo(cpNo: string): Promise<ChartDetail[]> {
    return await ChartDetailModel.find({ CPNo: cpNo }).exec();
  }

  async findAll(): Promise<ChartDetail[]> {
    return await ChartDetailModel.find().exec();
  }
}