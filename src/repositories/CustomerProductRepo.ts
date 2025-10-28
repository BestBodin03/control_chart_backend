import { CustomerProductData, CustomerProductModel, CustomerProduct } from "../models/entities/customerProduct";

export class CustomerProductRepository {
  async bulkCreate(data: CustomerProductData[]): Promise<CustomerProduct[]> {
    const ops = data.map(item => ({
      updateOne: {
        filter: { CPNo: item.CPNo },
        update: { $set: item },
        upsert: true
      }
    }));
    
    await CustomerProductModel.bulkWrite(ops);
    
    const cpNos = data.map(d => d.CPNo);
    return CustomerProductModel.find({ CPNo: { $in: cpNos } }).lean() as unknown as Promise<CustomerProduct[]>;
  }

  async findExistingCPNos(cpNos: string[]): Promise<string[]> {
    const existing = await CustomerProductModel.find({ CPNo: { $in: cpNos } }, 'CPNo').exec();
    return existing.map(cp => cp.CPNo);
  }

  async findByCPNo(cpNo: string): Promise<CustomerProduct | null> {
    return await CustomerProductModel.findOne({ CPNo: cpNo }).exec();
  }

  async findAll(): Promise<CustomerProduct[]> {
    return await CustomerProductModel.find().exec();
  }
}