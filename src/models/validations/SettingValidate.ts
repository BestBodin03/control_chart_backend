import z from "zod";

// DisplayType
export const DisplayTypeSchema = z.enum(['Furnace', 'Furnace/CP', 'CPNo.']);
export type DisplayType = z.infer<typeof DisplayTypeSchema>;

// PeriodType
export const PeriodTypeSchema = z.enum(['thisMonth', '3months', '6months', '1year', 'custom', 'anyTime']);
export type PeriodType = z.infer<typeof PeriodTypeSchema>;

// MainPeriod
export const PeriodSchema = z.object({
  type: PeriodTypeSchema,
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional()
}).refine(
  (data) => {
    if (data.type === 'custom') {
      return data.startDate && data.endDate && data.startDate <= data.endDate;
    }
    return !data.startDate && !data.endDate;
  },
  { 
    message: "I do not know." 
  }
);

// General Setting
export const GeneralSettingSchema = z.object({
  chartChangeInterval: z.number().min(1).max(3600), 
  period: PeriodSchema
});

// Specific Setting 
export const SpecificSettingSchema = z.object({
  furnaceNo: z.number().min(1),
  cpNo: z.string().min(1).max(50)
});

// Main Setting 
export const SettingSchema = z.object({
  settingProfileName: z.string().min(1).max(100),
  isUsed: z.boolean(),
  displayType: DisplayTypeSchema,
  generalSetting: GeneralSettingSchema,
  specificSetting: z.array(SpecificSettingSchema).min(1).max(10) // At least 1, max 10 settings
});

// Zod Schema for Creating Setting (without timestamps)
export const CreateSettingSchema = SettingSchema;

// Zod Schema for Updating Setting (all fields optional except id)
export const UpdateSettingSchema = SettingSchema.partial().extend({
  _id: z.string() // MongoDB ObjectId as string
});