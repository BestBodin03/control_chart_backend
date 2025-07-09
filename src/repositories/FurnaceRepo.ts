import { Model } from "mongoose";
import { FurnaceData, IFurnace } from "../models/Furnace";

export class FurnaceRepository {
  constructor(private furnaceModel: Model<IFurnace>) {}

  async create(furnaceData: FurnaceData): Promise<IFurnace> {
    const furnace = new this.furnaceModel(furnaceData);
    return await furnace.save();
  }

  async findAll(): Promise<IFurnace[]> {
    return await this.furnaceModel.find({ isDisplay: true });
  }

  async findByFurnaceNo(furnaceNo: number): Promise<IFurnace | null> {
    return await this.furnaceModel.findOne({ furnaceNo });
  }

//   async findById(id: string): Promise<IFurnace | null> {
//     return await this.furnaceModel.findById(id);
//   }


//   async update(id: string, updateData: Partial<FurnaceData>): Promise<IFurnace | null> {
//     return await this.furnaceModel.findByIdAndUpdate(id, updateData, { new: true });
//   }

//   async delete(id: string): Promise<IFurnace | null> {
//     return await this.furnaceModel.findByIdAndUpdate(id, { isDisplay: false }, { new: true });
//   }
}