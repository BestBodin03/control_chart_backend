import mongoose, { Schema, model, Document, Types } from 'mongoose';


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
  createdAt: Date;
  updatedAt: Date;
}

const furnaceSchema = new Schema<IFurnace>({
  furnaceNo: { type: Number, required: true, unique: true },
  furnaceDescription: { type: String, required: true },
  isDisplay: { type: Boolean, default: true }
}, { timestamps: true });

export const FurnaceModel = mongoose.models.Furnace || model<IFurnace>('Furnace', furnaceSchema);