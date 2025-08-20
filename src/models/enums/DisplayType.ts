import z from "zod";

export const DisplayType = {
  FURNACE: "FURNACE",
  FURNACE_CP: "FURNAC_CP",
  CP: "CP",
} as const;

export const displayTypeLiterals = [
  "FURNACE",
  "FURNAC_CP",
  "CP",
] as const;

export const displayTypeSchema = z.enum(displayTypeLiterals);
export type DisplayType = typeof displayTypeLiterals[number];