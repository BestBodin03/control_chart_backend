import mongoose, { Document, model, Schema, Types } from "mongoose";

export interface ICP extends Document {
  CPNo: string;
  furnaceId: Types.ObjectId[];
  specifications: {
    upperSpecLimit: number;
    lowerSpecLimit: number;
    target: number;
  };
  isDisplay: boolean;
}

export interface CPData {
  CPNo: string;
  furnaceId: Types.ObjectId[];
  specifications: {
    upperSpecLimit: number;
    lowerSpecLimit: number;
    target: number;
  };
  isDisplay: boolean;
}

const customerProductSchema = new Schema<ICP>({
  CPNo: { type: String, required: true, unique: true },
  furnaceId: [{ type: Schema.Types.ObjectId, ref: 'Furnace' }],
  specifications: {
    upperSpecLimit: { type: Number, required: true },
    lowerSpecLimit: { type: Number, required: true },
    target: { type: Number, required: true }
  },
  isDisplay: { type: Boolean, default: true }
}, { timestamps: true });

export const CustomerProductModel = mongoose.models.CustomerProduct || model<ICP>('CustomerProduct', customerProductSchema);