import { Schema, model, Document } from 'mongoose';

export interface IWarning extends Document {
  name: string;
  description: string;
  ruleType: string;
  conditions: {
    threshold: number;
    consecutivePoints: number;
    trendDirection: string;
  };
  color: string;
  severity: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const warningSchema = new Schema<IWarning>({
  name: String,
  description: String,
  ruleType: String,
  conditions: {
    threshold: Number,
    consecutivePoints: Number,
    trendDirection: String
  },
  color: String,
  severity: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default model<IWarning>('Warning', warningSchema);
