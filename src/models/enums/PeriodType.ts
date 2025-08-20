import { z } from "zod";

export const PeriodType = {
  ONE_MONTH: "ONE_MONTH",
  THREE_MONTHS: "THREE_MONTHS",
  SIX_MONTHS: "SIX_MONTHS",
  ONE_YEAR: "ONE_YEAR",
  CUSTOM: "CUSTOM",
  LIFETIME: "LIFETIME",
} as const;

export const periodTypeLiterals = [
  "ONE_MONTH",
  "THREE_MONTHS",
  "SIX_MONTHS",
  "ONE_YEAR",
  "CUSTOM",
  "LIFETIME",
] as const;

export const periodTypeSchema = z.enum(periodTypeLiterals);
export type PeriodType = typeof periodTypeLiterals[number];
