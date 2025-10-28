import mongoose, { Schema, model, Document } from 'mongoose';

export interface Furnace extends Document {
  furnaceNo: number;
  furnaceDescription: string;
  isDisplay: boolean;
  cpNo: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type FurnaceData = Omit<Furnace, keyof Document>;

const furnaceSchema = new Schema<Furnace>(
  {
    furnaceNo: { type: Number, required: true, unique: true },
    furnaceDescription: { type: String, required: true },
    isDisplay: { type: Boolean, default: true },
    cpNo: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const FurnaceModel =
  mongoose.models.Furnace || model<Furnace>('Furnace', furnaceSchema);
