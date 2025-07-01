import { Schema, model, Document } from 'mongoose';

export interface ISetting extends Document {
  type: string;
  settings: {
    refreshInterval: number;
    chartChangeInterval: number;
    defaultTimeRange: string;
    displayMode: string;
    theme: Record<string, any>;
  };
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const settingSchema = new Schema<ISetting>({
  type: String,
  settings: {
    refreshInterval: Number,
    chartChangeInterval: Number,
    defaultTimeRange: String,
    displayMode: String,
    theme: Schema.Types.Mixed
  },
  userId: String
}, { timestamps: true });

export default model<ISetting>('Config', settingSchema);
