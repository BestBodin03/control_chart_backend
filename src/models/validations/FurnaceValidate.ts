import z from "zod";

export const FurnaceValidation = z.object({
  furnaceNo: z.number().int().positive(),
  furnaceDescription: z.string().min(1),
  isDisplay: z.boolean().default(true).optional()
});