import mongoose, { Document, Schema, model } from "mongoose";

export interface ChartDetail extends Document {
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
    compoundLayer: number;
    CDE: {
      CDEX: number;
      CDTX: number;
    };
  };
}

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
    compoundLayer: number;
    CDE: {
      CDEX: number;
      CDTX: number;
    };
  };
}

const chartDetailSchema = new Schema<ChartDetail>({
  CPNo: { type: String, required: true },
  FGNo: { type: String, required: true, unique: true },
  chartGeneralDetail: {
    furnaceNo: { type: Number, required: true },
    part: { type: String, required: true },
    partName: { type: String, required: true },
    collectedDate: { type: Date, required: true }
  },
  machanicDetail: {
    surfaceHardnessMean: { type: Number, required: true },
    compoundLayer: {type: Number, required: true},
    CDE: {
      CDEX: { type: Number, required: true },
      CDTX: { type: Number, required: true }
    },
  }
}, { timestamps: true });

export const ChartDetailModel = mongoose.models.ChartDetail || model<ChartDetail>('ChartDetail', chartDetailSchema);
