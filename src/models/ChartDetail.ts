import mongoose, { Document, Schema, model } from "mongoose";
import z from "zod";
import { CustomerProductSchema } from "./CustomerProduct";
import { FurnaceSchema } from "./Furnace";

// ✅ CHART DETAIL MODEL
export const ChartDetailSchema = z.object({
  CPNo: z.string().min(1),
  FGNo: z.string().min(1),
  chartGeneralDetail: z.object({
    furnaceNo: z.number(),
    part: z.string(),
    partName: z.string(),
    collectedDate: z.date()
  }),
  machanicDetail: z.object({
    surfaceHardnessMean: z.number(),
    hardnessAt01mmMean: z.number(),
    CDE: z.object({
      CDEX: z.number(),
      CDEY: z.number()
    }),
    coreHardnessMean: z.number(),
    compoundLayer: z.number()
  })
});

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
export type FurnaceInput = z.infer<typeof FurnaceSchema>;
export type CustomerProductInput = z.infer<typeof CustomerProductSchema>;
export type ChartDetailInput = z.infer<typeof ChartDetailSchema>;

// ✅ FG DATA ENCODING INTERFACE
export interface FGDataEncoding {
  masterCollectedDate: Date;
  masterFurnaceNo: number;
  masterFGcode: string;
}