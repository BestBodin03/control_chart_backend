import mongoose, { Document, Schema, model } from "mongoose";
import { FurnaceValidation } from "./validations/FurnaceValidate";
import { ChartDetailValidate } from "./validations/ChartDetailValidate";
import { CustomerProductValidate } from "./validations/CustomerProductValidate";
import z from "zod";

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
    hardnessAt01mmMean: number;
    CDE: {
      CDEX: number;
      CDEY: number;
    };
    coreHardnessMean: number;
    compoundLayer: number;
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
    hardnessAt01mmMean: { type: Number, required: true },
    CDE: {
      CDEX: { type: Number, required: true },
      CDEY: { type: Number, required: true }
    },
    coreHardnessMean: { type: Number, required: true },
    compoundLayer: { type: Number, required: true }
  }
}, { timestamps: true });

export const ChartDetailModel = mongoose.models.ChartDetail || model<IChartDetail>('ChartDetail', chartDetailSchema);

// ✅ TYPE EXPORTS
// export type FurnaceInput = z.infer<typeof FurnaceValidation>;
// export type CustomerProductInput = z.infer<typeof CustomerProductValidate>;
// export type ChartDetailInput = z.infer<typeof ChartDetailValidate>;
