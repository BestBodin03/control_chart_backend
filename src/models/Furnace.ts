import { Schema, model, Document } from 'mongoose';

export interface IFurnace extends Document {
  furnaceNo: number;
  furnaceDescription: string;
  isDisplay: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// เพิ่ม interface สำหรับ data ที่จะส่งไปสร้าง document
export interface FurnaceData {
  furnaceNo: number;
  furnaceDescription: string;
  isDisplay: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const furnaceSchema = new Schema<IFurnace>(
  {
    furnaceNo: { type: Number, required: true },
    furnaceDescription: { type: String, required: true },
    isDisplay: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export default model<IFurnace>('Furnace', furnaceSchema);