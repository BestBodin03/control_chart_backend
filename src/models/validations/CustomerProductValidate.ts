import z from "zod";

// ✅ CUSTOMER PRODUCT MODEL
export const CustomerProductValidate = z.object({
  CPNo: z.string().min(1),
  furnaceId: z.array(z.string()).default([]),
  specifications: z.object({
    upperSpecLimit: z.number(),
    lowerSpecLimit: z.number(),
    target: z.number()
  }),
  isDisplay: z.boolean().default(true).optional()
});