import { Schema, model, Document } from 'mongoose';

export interface IPart extends Document {
  partNo: string;
  partName: string;
  customer: string;
  description: string;
  specifications: {
    upperSpecLimit: number;
    lowerSpecLimit: number;
    target: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const partSchema = new Schema<IPart>({
  partNo: { type: String, required: true },
  partName: { type: String, required: true },
  customer: { type: String, required: true },
  description: String,
  specifications: {
    upperSpecLimit: Number,
    lowerSpecLimit: Number,
    target: Number
  },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default model<IPart>('Part', partSchema);
