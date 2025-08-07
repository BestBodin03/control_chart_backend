import { FurnaceData, FurnaceModel, IFurnace } from "../models/Furnace";

// ✅ Furnace Repository
export class FurnaceRepository {
  async bulkCreate(data: FurnaceData[]): Promise<IFurnace[]> {
    const ops = data.map(item => ({
      updateOne: {
        filter: { furnaceNo: item.furnaceNo },
        update: { $set: item },
        upsert: true
      }
    }));
    
    await FurnaceModel.bulkWrite(ops);
    
    const furnaceNos = data.map(d => d.furnaceNo);
    return FurnaceModel.find({ furnaceNo: { $in: furnaceNos } }).lean() as unknown as Promise<IFurnace[]>;
  }

  async findExistingFurnaceNos(furnaceNos: number[]): Promise<number[]> {
    const existing = await FurnaceModel.find({ furnaceNo: { $in: furnaceNos } }, 'furnaceNo').exec();
    return existing.map(f => f.furnaceNo);
  }

  async findByFurnaceNo(furnaceNo: number): Promise<IFurnace | null> {
    return await FurnaceModel.findOne({ furnaceNo }).exec();
  }

  async findAll(): Promise<IFurnace[]> {
    return await FurnaceModel.find().exec();
  }
}