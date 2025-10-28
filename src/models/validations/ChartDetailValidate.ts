import z from "zod";

// ✅ CHART DETAIL MODEL
export const ChartDetailValidate = z.object({
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
    CDE: z.object({
      CDEX: z.number(),
      CDTX: z.number()
    }),
  })
});