import { Schema, model, Document, Types } from 'mongoose';

export interface IControlChart extends Document {
  furnaceId: Types.ObjectId;
  partId: Types.ObjectId;
  timestamp: Date;
  value: number;
  batchNo: string;
  operator: string;
  controlLimits: {
    upperControlLimit: number;
    lowerControlLimit: number;
    average: number;
    upperSpecLimit: number;
    lowerSpecLimit: number;
  };
  alerts: {
    type: string;
    severity: string;
    color: string;
    triggered: boolean;
  }[];
  createdAt: Date;
}

const controlChartSchema = new Schema<IControlChart>({
  furnaceId: { type: Schema.Types.ObjectId, ref: 'Furnace', required: true },
  partId: { type: Schema.Types.ObjectId, ref: 'Part', required: true },
  timestamp: Date,
  value: Number,
  batchNo: String,
  operator: String,
  controlLimits: {
    upperControlLimit: Number,
    lowerControlLimit: Number,
    average: Number,
    upperSpecLimit: Number,
    lowerSpecLimit: Number
  },
  alerts: [{
    type: String,
    severity: String,
    color: String,
    triggered: Boolean
  }],
  createdAt: { type: Date, default: Date.now }
});

export default model<IControlChart>('ControlChart', controlChartSchema);
