import { Schema, model, Document } from 'mongoose';

export interface IChartDetail extends Document {
  CPNo: string;
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
  CPNo: string;
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
  CPNo: { type: String},
  FGNo: { type: String},
  chartGeneralDetail: {
    furnaceNo: { type: Number},
    part: { type: String},
    partName: { type: String},
    collectedDate: { type: Date}
  },
  machanicDetail: {
    surfaceHardnessMean: { type: Number},
    hardnessAt01mmMean: { type: Number},
    CDE: {
      CDEX: { type: Number},
      CDEY: { type: Number},
    },
    coreHardnessMean: { type: Number},
    compoundLayer: { type: Number},
  },
  updatedAt: { type: Date, default: Date.now },
});

export default model<IChartDetail>('ChartDetail', chartDetailSchema);