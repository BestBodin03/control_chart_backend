import { Schema, model, Document } from 'mongoose';

export interface IFurnace extends Document {
  furnaceNo: number;
  furnaceDescription: string;
  isDisplay: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FurnaceData {
  furnaceNo: number;
  furnaceDescription: string;
  isDisplay: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const furnaceSchema = new Schema<IFurnace>(
  {
    furnaceNo: { type: Number },
    furnaceDescription: { type: String },
    isDisplay: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export default model<IFurnace>('Furnace', furnaceSchema);