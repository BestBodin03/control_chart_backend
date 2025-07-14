import { any } from "zod";
import { ChartDetailData, IChartDetail } from "../models/ChartDetail";
import { ISetting, SettingData } from "../models/Setting";

export class ChartDetailFilterWithSettingService {
    async FilterWithSetting(settingData: SettingData, chartDetailData: ChartDetailData): Promise<IChartDetail[]> {
        const settingProfile = await

        return any;
        
    }
}