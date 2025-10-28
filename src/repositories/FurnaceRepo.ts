import { FurnaceData, FurnaceModel, Furnace } from "../models/entities/furnace";

export class FurnaceRepository {
  async bulkCreate(data: FurnaceData[]): Promise<Furnace[]> {
    const ops = data.map(item => ({
      updateOne: {
        filter: { furnaceNo: item.furnaceNo },
        update: { $set: item },
        upsert: true
      }
    }));
    
    await FurnaceModel.bulkWrite(ops);
    
    const furnaceNos = data.map(d => d.furnaceNo);
    return FurnaceModel.find({ furnaceNo: { $in: furnaceNos } }).lean() as unknown as Promise<Furnace[]>;
  }

  async findExistingFurnaceNos(furnaceNos: number[]): Promise<number[]> {
    const existing = await FurnaceModel.find({ furnaceNo: { $in: furnaceNos } }, 'furnaceNo').exec();
    return existing.map(f => f.furnaceNo);
  }

  async findByFurnaceNo(furnaceNo: number): Promise<Furnace | null> {
    return await FurnaceModel.findOne({ furnaceNo }).exec();
  }

  async findAll(): Promise<Furnace[]> {
    return await FurnaceModel.find().exec();
  }
}