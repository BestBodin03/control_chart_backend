import z from "zod";

export const DisplayType = {
  FURNACE: "Furnace",
  FURNACE_CP: "Furnace/CP",
  CP: "CP",
} as const;

export const displayTypeLiterals = [
  "Furnace",
  "Furnace/CP",
  "CP",
] as const;

export const displayTypeSchema = z.enum(displayTypeLiterals);
export type DisplayType = typeof displayTypeLiterals[number];