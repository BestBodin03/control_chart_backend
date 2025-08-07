import mongoose, { Document, Schema, model } from "mongoose";
import { FurnaceValidation } from "./validations/FurnaceValidate";
import { ChartDetailValidate } from "./validations/ChartDetailValidate";
import { CustomerProductValidate } from "./validations/CustomerProductValidate";

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
    CDE: {
      CDEX: number;
      CDTX: number;
    };
  };
}

const chartDetailSchema = new Schema<IChartDetail>({
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
    CDE: {
      CDEX: { type: Number, required: true },
      CDTX: { type: Number, required: true }
    },
  }
}, { timestamps: true });

export const ChartDetailModel = mongoose.models.ChartDetail || model<IChartDetail>('ChartDetail', chartDetailSchema);

// ✅ TYPE EXPORTS
// export type FurnaceInput = z.infer<typeof FurnaceValidation>;
// export type CustomerProductInput = z.infer<typeof CustomerProductValidate>;
// export type ChartDetailInput = z.infer<typeof ChartDetailValidate>;
