import { z } from "zod";
import { Types } from "mongoose";
import { displayTypeLiterals, displayTypeSchema } from "../enums/displayType";
import { periodTypeLiterals, periodTypeSchema } from "../enums/periodType";

export const settingEntitySchema = z.object({
  _id: z.instanceof(Types.ObjectId), // MongoDB document _id
  settingProfileName: z.string().min(1).max(100),
  isUsed: z.boolean(),
  displayType: z.enum(displayTypeLiterals), // "Furnace" | "Furnace/CP" | "CP"
  generalSetting: z.object({
    chartChangeInterval: z.number().min(10).max(3600),
    nelsonRule: z.array(
      z.object({
        ruleId: z.number(),
        ruleName: z.string(),
        ruleDescription: z.string(),
        ruleIndicated: z.string(),
        isUsed: z.boolean(),
      })
    )
  }),
  specificSetting: z.array(
    z.object({
      period: z.object({
        type: z.enum(periodTypeLiterals), // "1Month" | "3months" | ...
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }),
      furnaceNo: z.number().int().min(1),
      cpNo: z.string().min(1).max(50),
    })
  ),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type SettingEntity = z.infer<typeof settingEntitySchema>;

export const settingDTOSchema = z.object({
  id: z.string().optional(),

  settingProfileName: z.string().min(1).max(100),
  isUsed: z.boolean(),
  displayType: displayTypeSchema,

  generalSetting: z.object({
    chartChangeInterval: z.number().min(10).max(3600),
    nelsonRule: z.array(
      z.object({
        ruleId: z.number(),
        ruleName: z.string(),
        ruleDescription: z.string(),
        ruleIndicated: z.string(),
        isUsed: z.boolean(),
      })
    )
  }),

  specificSetting: z.array(
    z.object({
      period: z.object({
        type: periodTypeSchema,
        startDate: z.string().datetime(),
        endDate: z.string().datetime(),
      }),
      furnaceNo: z.number().int().min(1),
      cpNo: z.string().min(1).max(50),
    })
  ).min(1),

  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type SettingDTO = z.infer<typeof settingDTOSchema>;

export const SettingDTO = {
  convertFromEntity(entity: SettingEntity): SettingDTO {
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
          ruleDescription: r.ruleDescription,
          ruleIndicated: r.ruleIndicated,
          isUsed: r.isUsed,
        })),
      },

      specificSetting: entity.specificSetting.map((s) => ({
        period: {
          type: s.period.type,
          startDate: s.period.startDate ? s.period.startDate.toISOString() : '-',
          endDate: s.period.endDate ? s.period.endDate.toISOString() : '-',
        },
        furnaceNo: s.furnaceNo,
        cpNo: s.cpNo,
      })),

      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
    return settingDTOSchema.parse(candidate);
  },
};

