import { Schema, model, Document } from 'mongoose';

export interface IRule extends Document {
  ruleName: string;
  ruleDescription: string;
  alertColor: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ruleSchema = new Schema<IRule>({
  ruleName: String,
  ruleDescription: String,
  alertColor: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default model<IRule>('Rule', ruleSchema);
