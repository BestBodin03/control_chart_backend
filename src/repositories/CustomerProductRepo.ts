import { CPData, CustomerProductModel, ICP } from "../models/CustomerProduct";

export class CustomerProductRepository {
  async bulkCreate(data: CPData[]): Promise<ICP[]> {
    const ops = data.map(item => ({
      updateOne: {
        filter: { CPNo: item.CPNo },
        update: { $set: item },
        upsert: true
      }
    }));
    
    await CustomerProductModel.bulkWrite(ops);
    
    const cpNos = data.map(d => d.CPNo);
    return CustomerProductModel.find({ CPNo: { $in: cpNos } }).lean() as unknown as Promise<ICP[]>;
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