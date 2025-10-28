import { DisplayType } from "../../models/enums/displayType";
import { GeneralSetting, SpecificSetting } from "./settingResponse";

export type SettingRequest = {
  settingProfileName: string;
  isUsed: boolean;
  displayType: DisplayType;
  generalSetting: GeneralSetting;
  specificSetting: SpecificSetting[];
};