import { Schema, model, Document, Types } from 'mongoose';

export interface ILot extends Document {
  lotNo: string;
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

// Data interface สำหรับการสร้าง document
export interface LotData {
  lotNo: string;
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

const lotSchema = new Schema<ILot>(
  {
    lotNo: { type: String, required: true },
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

export default model<ILot>('Lot', lotSchema);