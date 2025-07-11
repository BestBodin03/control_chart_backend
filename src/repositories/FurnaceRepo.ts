import { FurnaceData, FurnaceModel, IFurnace } from "../models/Furnace";

// ✅ Furnace Repository
export class FurnaceRepository {
  async bulkCreate(furnaceData: FurnaceData[]): Promise<IFurnace[]> {
    try {
      return await FurnaceModel.insertMany(furnaceData, { ordered: false });
    } catch (error: any) {
      // Handle duplicate key errors but continue with unique records
      if (error.code === 11000) {
        console.log('Some furnaces already exist, continuing...');
        return error.insertedDocs || [];
      }
      throw error;
    }
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