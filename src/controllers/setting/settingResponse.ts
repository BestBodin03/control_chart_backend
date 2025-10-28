import { DisplayType } from "../../models/enums/displayType";
import { PeriodType } from "../../models/enums/periodType";

export type NelsonRule = {
    ruleId: number;
    ruleName: string;
    ruleDescription: string;
    ruleIndicated: string;
    isUsed: boolean;
};

export type GeneralSetting = {
  chartChangeInterval: number;
  nelsonRule: NelsonRule[];
};

export type Period = {
  type: PeriodType;
  startDate?: Date;
  endDate?: Date;
};

export type SpecificSetting = {
  period: Period;
  furnaceNo: number;
  cpNo: string;
};

export type SettingResponse = {
  settingProfileName: string;
  isUsed: boolean;
  displayType: DisplayType;
  generalSetting: GeneralSetting;
  specificSetting: SpecificSetting[];
};
