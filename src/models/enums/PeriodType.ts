import { z } from "zod";

export const PeriodType = {
  ONE_MONTH: "1Month",
  THREE_MONTHS: "3months",
  SIX_MONTHS: "6months",
  ONE_YEAR: "1year",
  CUSTOM: "custom",
  ANY_TIME: "anyTime",
} as const;

export const periodTypeLiterals = [
  "1Month",
  "3months",
  "6months",
  "1year",
  "custom",
  "anyTime",
] as const;

export const periodTypeSchema = z.enum(periodTypeLiterals);
export type PeriodType = typeof periodTypeLiterals[number];
