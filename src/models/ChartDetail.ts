import { Schema, model, Document } from 'mongoose';

export interface IChartDetail extends Document {
  lotNo: string;
  FGNo: string;
  chartGeneralDetail: {
    furnaceNo: number;
    part: string;
    partName: string;
    collectedDate: Date;
  };
  machanicDetail: {
    surfaceHardnessMean: number;
    hardnessAt01mmMean: number;
    CDE: {
      CDEX: number;
      CDEY: number;
    };
    coreHardnessMean: number;
    compoundLayer: number;
  };
  updatedAt: Date;
}

// Data interface สำหรับการสร้าง document
export interface ChartDetailData {
  lotNo: string;
  FGNo: string;
  chartGeneralDetail: {
    furnaceNo: number;
    part: string;
    partName: string;
    collectedDate: Date;
  };
  machanicDetail: {
    surfaceHardnessMean: number;
    hardnessAt01mmMean: number;
    CDE: {
      CDEX: number;
      CDEY: number;
    };
    coreHardnessMean: number;
    compoundLayer: number;
  };
  updatedAt?: Date;
}

const chartDetailSchema = new Schema<IChartDetail>({
  lotNo: { type: String, required: true },
  FGNo: { type: String, required: true },
  chartGeneralDetail: {
    furnaceNo: { type: Number, required: true },
    part: { type: String, required: true },
    partName: { type: String, required: true },
    collectedDate: { type: Date, required: true}
  },
  machanicDetail: {
    surfaceHardnessMean: { type: Number, required: true },
    hardnessAt01mmMean: { type: Number, required: true },
    CDE: {
      CDEX: { type: Number, required: true },
      CDEY: { type: Number, required: true },
    },
    coreHardnessMean: { type: Number, required: true },
    compoundLayer: { type: Number, required: true },
  },
  updatedAt: { type: Date, default: Date.now },
});

export default model<IChartDetail>('ChartDetail', chartDetailSchema);