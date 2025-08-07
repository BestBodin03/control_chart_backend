import mongoose, { Document, model, Schema, Types } from "mongoose";

// แก้ไข Interface ICP ให้ตรงกับ CPData
export interface ICP extends Document {
  CPNo: string;
  furnaceId: Types.ObjectId[];
  surfaceHardnessUSpec?: number; // เพิ่ม spec fields
  surfaceHardnessLSpec?: number;
  surfaceHardnessTarget?: number;
  cdeUSpec?: number;
  cdeLSpec?: number;
  cdeTarget?: number;
  cdtUSpec?: number;
  cdtLSpec?: number;
  cdtTarget?: number;
  isDisplay: boolean;
}

// หรือทำให้ CPData extends ICP
export interface CPData {
  CPNo: string;
  furnaceId: Types.ObjectId[];
  surfaceHardnessUSpec?: number; // เพิ่ม spec fields
  surfaceHardnessLSpec?: number;
  surfaceHardnessTarget?: number;
  cdeUSpec?: number;
  cdeLSpec?: number;
  cdeTarget?: number;
  cdtUSpec?: number;
  cdtLSpec?: number;
  cdtTarget?: number;
  isDisplay: boolean;
}

// แก้ไข Schema
const customerProductSchema = new Schema<ICP>({
  CPNo: { type: String, required: true, unique: true },
  furnaceId: [{ type: Schema.Types.ObjectId, ref: 'Furnace' }],
  surfaceHardnessUSpec: { type: Number, required: false, default: null },
  surfaceHardnessLSpec: { type: Number, required: false, default: null },
  surfaceHardnessTarget: { type: Number, required: false, default: null },
  cdeUSpec: { type: Number, required: false, default: null },
  cdeLSpec: { type: Number, required: false, default: null },
  cdeTarget: { type: Number, required: false, default: null },
  cdtUSpec: { type: Number, required: false, default: null },
  cdtLSpec: { type: Number, required: false, default: null },
  cdtTarget: { type: Number, required: false, default: null },
  isDisplay: { type: Boolean, default: true }
}, { timestamps: true });

export const CustomerProductModel = mongoose.models.CustomerProduct || model<ICP>('CustomerProduct', customerProductSchema);