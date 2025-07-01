import mongoose, { Schema, Document } from 'mongoose';

export interface IFurnace extends Document {
  furnaceNo: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FurnaceSchema: Schema = new Schema(
  {
    furnaceNo: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Furnace = mongoose.model<IFurnace>('Furnace', FurnaceSchema);
export default Furnace;
