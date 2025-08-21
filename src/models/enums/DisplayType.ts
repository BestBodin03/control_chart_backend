import z from "zod";

export const DisplayType = {
  FURNACE: "FURNACE",
  FURNACE_CP: "FURNACE_CP",
  CP: "CP",
} as const;

export const displayTypeLiterals = [
  "FURNACE",
  "FURNACE_CP",
  "CP",
] as const;

export const displayTypeSchema = z.enum(displayTypeLiterals);
export type DisplayType = typeof displayTypeLiterals[number];