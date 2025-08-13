import mongoose, { Schema, model, Document, Types } from 'mongoose';


export interface Furnace extends Document {
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

const furnaceSchema = new Schema<Furnace>({
  furnaceNo: { type: Number, required: true, unique: true },
  furnaceDescription: { type: String, required: true },
  isDisplay: { type: Boolean, default: true }
}, { timestamps: true });

export const FurnaceModel = mongoose.models.Furnace || model<Furnace>('Furnace', furnaceSchema);