import { Schema, model, Document, Types } from 'mongoose';

export interface ICP extends Document {
  CPNo: string;
  furnaceId: Types.ObjectId[];
  specifications: {
    upperSpecLimit: number;
    lowerSpecLimit: number;
    target: number;
  };
  isDisplay: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CPData {
  CPNo: string;
  furnaceId: Types.ObjectId[];
  specifications: {
    upperSpecLimit: number;
    lowerSpecLimit: number;
    target: number;
  };
  isDisplay?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const CPSchema = new Schema<ICP>(
  {
    CPNo: { type: String},
    furnaceId: [{ type: Schema.Types.ObjectId, ref: 'Furnace', required: true }],
    specifications: {
      upperSpecLimit: Number,
      lowerSpecLimit: Number,
      target: Number,
    },
    isDisplay: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default model<ICP>('CustomerProduct', CPSchema);