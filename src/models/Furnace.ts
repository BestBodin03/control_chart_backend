// models/Furnace.ts
import { Schema, model, Document } from 'mongoose';

export interface IFurnace extends Document {
  furnaceNo: string;
  furnaceDescription: string;
  isDisplay: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const furnaceSchema = new Schema<IFurnace>(
  {
    furnaceNo: { type: String, required: true, unique: true },
    furnaceDescription: { type: String, required: true },
    isDisplay: { type: Boolean, default: true },
  },
  {
    timestamps: true, 
  }
);

export default model<IFurnace>('Furnace', furnaceSchema);
