import { CPData, CustomerProductModel, ICP } from "../models/CustomerProduct";

export class CustomerProductRepository {
  async bulkCreate(cpData: CPData[]): Promise<ICP[]> {
    try {
      return await CustomerProductModel.insertMany(cpData, { ordered: false });
    } catch (error: any) {
      // Handle duplicate key errors but continue with unique records
      if (error.code === 11000) {
        console.log('Some customer products already exist, continuing...');
        return error.insertedDocs || [];
      }
      throw error;
    }
  }

  async findExistingCPNos(cpNos: string[]): Promise<string[]> {
    // ❌ FIXED: $for should be $in
    const existing = await CustomerProductModel.find({ CPNo: { $in: cpNos } }, 'CPNo').exec();
    return existing.map(cp => cp.CPNo);
  }

  async findByCPNo(cpNo: string): Promise<ICP | null> {
    return await CustomerProductModel.findOne({ CPNo: cpNo }).exec();
  }

  async findAll(): Promise<ICP[]> {
    return await CustomerProductModel.find().exec();
  }
}