import { now, Types } from "mongoose";
import {
  CreateSettingProfileRequest,
  SettingDTO,
  settingDTOSchema,
} from "../validations/SettingValidate";
import { SettingEntity } from "../validations/SettingValidate"; // or your entity model path

// 1) DTO (request) -> Entity (for repo.save)
export const toEntity = (req: CreateSettingProfileRequest): SettingEntity => {
  const now = new Date();

  return {
    _id: new Types.ObjectId(),
    settingProfileName: req.settingProfileName,
    isUsed: false,
    displayType: req.displayType,
    generalSetting: {
      chartChangeInterval: req.generalSetting.chartChangeInterval,
      nelsonRule: req.generalSetting.nelsonRule.map(r => ({
        ruleId: r.ruleId,
        ruleName: r.ruleName,
        ruleDescription: r.ruleDescription,
        ruleIndicated: r.ruleIndicated,
        isUsed: r.isUsed,
      })),
    },
    specificSetting: req.specificSetting.map(sp => ({
      period: {
        type: sp.period.type,
        startDate: sp.period.startDate,
        endDate: sp.period.endDate,
      },
      furnaceNo: sp.furnaceNo ?? undefined,
      cpNo: sp.cpNo ?? undefined,
    })),
    createdAt: now,
    updatedAt: now,
  };
};

// 2) Entity/Document -> DTO (for response)
export const fromEntity = (e: SettingEntity): SettingDTO => {
  const dtoCandidate: SettingDTO = {
    id: e._id.toHexString(),
    settingProfileName: e.settingProfileName,
    isUsed: e.isUsed,
    displayType: e.displayType,
    generalSetting: {
      chartChangeInterval: e.generalSetting.chartChangeInterval,
      nelsonRule: e.generalSetting.nelsonRule.map(r => ({
        ruleId: r.ruleId,
        ruleName: r.ruleName,
        ruleDescription: r.ruleDescription,
        ruleIndicated: r.ruleIndicated,
        isUsed: r.isUsed,
      })),
    },
    specificSetting: e.specificSetting.map(sp => ({
      period: {
        type: sp.period.type,
        startDate: sp.period.startDate ? sp.period.startDate.toISOString() : new Date(0).toISOString(),
        endDate:   sp.period.endDate   ? sp.period.endDate.toISOString()   : new Date(0).toISOString(),
      },
      furnaceNo: sp.furnaceNo,
      cpNo: sp.cpNo,
    })),
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
  };

  return settingDTOSchema.parse(dtoCandidate);
};
