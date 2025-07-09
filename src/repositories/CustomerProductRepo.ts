import { Model } from "mongoose";
import { CPData, ICP } from "../models/CustomerProduct";

export class CustomerProductRepository {
  constructor(private cpModel: Model<ICP>) {}

  async create(cpData: CPData): Promise<ICP> {
    const customerProduct = new this.cpModel(cpData);
    return await customerProduct.save();
  }

  async findByCPNo(cpNo: string): Promise<ICP | null> {
    return await this.cpModel.findOne({ CPNo: cpNo }).populate('furnaceId');
  }

//   async findAll(): Promise<ICP[]> {
//     return await this.cpModel.find({ isDisplay: true }).populate('furnaceId');
//   }

//   async findById(id: string): Promise<ICP | null> {
//     return await this.cpModel.findById(id).populate('furnaceId');
//   }

//   async update(id: string, updateData: Partial<CPData>): Promise<ICP | null> {
//     return await this.cpModel.findByIdAndUpdate(id, updateData, { new: true }).populate('furnaceId');
//   }

//   async delete(id: string): Promise<ICP | null> {
//     return await this.cpModel.findByIdAndUpdate(id, { isDisplay: false }, { new: true });
//   }
}