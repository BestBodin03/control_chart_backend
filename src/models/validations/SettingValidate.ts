import { z } from "zod";
import { now, Types } from "mongoose";
import { displayTypeLiterals, displayTypeSchema } from "../enums/DisplayType";
import { periodTypeLiterals, periodTypeSchema } from "../enums/PeriodType";

export const settingEntitySchema = z.object({
  _id: z.instanceof(Types.ObjectId),
  settingProfileName: z.string().min(1).max(100),
  isUsed: z.boolean(),
  displayType: z.enum(displayTypeLiterals),
  generalSetting: z.object({
    chartChangeInterval: z.number().min(10).max(3600),
    nelsonRule: z.array(
      z.object({
        ruleId: z.number(),
        ruleName: z.string(),
        ruleDescription: z.string().optional(),
        ruleIndicated: z.string().optional(),
        isUsed: z.boolean(),
      })
    )
  }),
  specificSetting: z.array(
    z.object({
      period: z.object({
        type: z.enum(periodTypeLiterals),
        startDate: z.date(),
        endDate: z.date(),
      }),
      furnaceNo: z.number().int().min(1).nullish().optional(),
      cpNo:     z.string().min(1).max(50).nullish().optional(),

    })
  ),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type SettingEntity = z.infer<typeof settingEntitySchema>;

const nelsonRuleItem = z.object({
  ruleId: z.number(),
  ruleName: z.string(),
  ruleDescription: z.preprocess(
    v => v === null ? undefined : v,
    z.string().optional()
  ),
  ruleIndicated: z.preprocess(
    v => v === null ? undefined : v,
    z.string().optional()
  ),
  isUsed: z.boolean(),
});

export const settingDTOSchema = z.object({
  id: z.string().optional(),

  settingProfileName: z.string().min(1).max(100),
  isUsed: z.boolean(),
  displayType: displayTypeSchema,

  generalSetting: z.object({
    chartChangeInterval: z.number().min(10).max(3600),
    nelsonRule: z.array(nelsonRuleItem), 
  }),

  specificSetting: z.array(
    z.object({
      period: z.object({
        type: periodTypeSchema,
        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().optional(),
      }),
      furnaceNo: z.number().int().min(1).nullish().optional(),
      cpNo:     z.string().min(1).max(50).nullish().optional(),

    })
  ).min(1),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type SettingDTO = z.infer<typeof settingDTOSchema> | undefined | [];

export const settingDTO = {
  convertFromEntity(entity: SettingEntity): SettingDTO {
    const iso = (d?: Date | undefined) => (d ? d.toISOString() : undefined);

    const candidate: SettingDTO = {
      id: entity._id.toHexString(),
      settingProfileName: entity.settingProfileName,
      isUsed: entity.isUsed,
      displayType: entity.displayType,

      generalSetting: {
        chartChangeInterval: entity.generalSetting.chartChangeInterval,
        nelsonRule: entity.generalSetting.nelsonRule.map((r) => ({
          ruleId: r.ruleId,
          ruleName: r.ruleName,
          ruleDescription: r.ruleDescription ?? undefined, // ok กับ schema
          ruleIndicated: r.ruleIndicated ?? undefined,     // ok กับ schema
          isUsed: r.isUsed,
        })),
      },

      specificSetting: entity.specificSetting.map((s) => ({
        period: {
          type: s.period.type,
          ...(s.period.startDate ? { startDate: iso(s.period.startDate) } : {}),
          ...(s.period.endDate ? { endDate: iso(s.period.endDate) } : {}),
        },
        furnaceNo: s.furnaceNo ?? undefined,
        cpNo: s.cpNo ?? undefined,
      })),

      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };

    return settingDTOSchema.parse(candidate);
  },
};


export const requiredCoercedDate = z.coerce.date({
  required_error: "date is required",
  invalid_type_error: "invalid date",
});

// derive create schema but override dates to be Date (not string)
export const createSettingProfileRequestSchema = settingDTOSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    specificSetting: z.array(z.object({
      period: z.object({
        type: periodTypeSchema,
        startDate: requiredCoercedDate, // ← Date
        endDate:   requiredCoercedDate, // ← Date
      }),
      furnaceNo: z.number().int().min(1).nullish().optional(),
      cpNo:     z.string().min(1).max(50).nullish().optional(),
    })).min(1),
  });

export type CreateSettingProfileRequest = z.infer<typeof createSettingProfileRequestSchema>;

// derive create schema but override dates to be Date (not string)
export const updateSettingProfileRequestSchema = settingDTOSchema
  .omit({
    createdAt: true,
    specificSetting: true,
  })
  .extend({
    id: z.string().optional(),
    specificSetting: z.array(z.object({
      period: z.object({
        type: periodTypeSchema,
        startDate: requiredCoercedDate, // ← Date
        endDate:   requiredCoercedDate, // ← Date
      }),
      furnaceNo: z.number().int().min(1).nullish().optional(),
      cpNo:     z.string().min(1).max(50).nullish().optional(),
    })).min(1),

    updatedAt: z.date().optional()
  });

export type UpdateSettingProfileRequest = z.infer<typeof updateSettingProfileRequestSchema>;

export const deleteSettingProfileRequestSchema = z.object({
  ids: z.array(
    z.string().regex(/^[0-9a-fA-F]{24}$/,"Invalid ObjectId")
  ).min(1,"ids must contain at least 1 id to delete"),
});

export type DeleteSettingProfileRequest = z.infer<typeof deleteSettingProfileRequestSchema>;

export const objectIdSchema = z.object({
  id: z.string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId")
});



