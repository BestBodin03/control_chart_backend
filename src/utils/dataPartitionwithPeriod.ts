import { count } from "console";
import { ChartDetailData, ChartDetailModel, IChartDetail } from "../models/ChartDetail";
import { ISetting, SettingData, SettingModel } from "../models/Setting";

export interface IPeriodFilter {
  name: String;
  startDate: Date;
  endDate: Date;
}

export class DataPartitionwithPeriod {
    static async getDateBySettingProfileName(periodName: String) {
        try {
            const settingPeriod = await SettingModel.findOne({
                settingProfileName: periodName
            }).select(
                'settingProfileName generalSetting.period.startDate generalSetting.period.endDate'
            )
            if (!settingPeriod) {
                throw new Error(`Period '${periodName}' not found`);
            }
            return {
                name: settingPeriod.settingProfileName!,
                startDate: settingPeriod.generalSetting.period.startDate! ,
                endDate: settingPeriod.generalSetting.period.endDate!
            }

        } catch (error) {
            console.error('Error getting period:', error);
            throw error;
        }
    }

    static async makeDataPartitionWithDate(periodFilter: IPeriodFilter) {
        try {
            // กรองข้อมูลตามช่วงเวลาใน periodFilter
            const dataPartition = await ChartDetailModel.find({
                "chartGeneralDetail.collectedDate": {
                    $gte: periodFilter.startDate,
                    $lte: periodFilter.endDate
                }
            }).lean(); // ใช้ lean() เพื่อ performance
            console.log(`This is number of Partitioned Data ${dataPartition.toLocaleString}`);

            return {
                data: dataPartition,
                count: dataPartition.length,
                periodInfo: {
                    name: periodFilter.name,
                    startDate: periodFilter.startDate,
                    endDate: periodFilter.endDate
                }
            };

        } catch (error) {
            console.error('Error making data partition:', error);
            throw error;
        }
    }
    static async FilterChartDetail(settingFiltering: ISetting, preFilteredData?: any[]) {
        try {
            // If pre-filtered data is provided, filter from that data
            if (preFilteredData && preFilteredData.length > 0) {
                let filteredData = preFilteredData;

                // Apply specific settings filter on pre-filtered data
                if (settingFiltering.specificSetting?.length > 0) {
                    filteredData = preFilteredData.filter(item => {
                        return settingFiltering.specificSetting.some(setting => 
                            item.CPNo === setting.cpNo && 
                            item.chartGeneralDetail?.furnaceNo === setting.furnaceNo
                        );
                    });
                }

                return {
                    data: filteredData,
                    count: filteredData.length
                };
            }

            // Original database query if no pre-filtered data
            const queryConditions: any = {};

            if (settingFiltering.specificSetting?.length > 0) {
                queryConditions.$or = settingFiltering.specificSetting.map(setting => ({
                    "CPNo": setting.cpNo,
                    "chartGeneralDetail.furnaceNo": setting.furnaceNo
                }));
            }

            if (settingFiltering.generalSetting?.period) {
                const { startDate, endDate } = settingFiltering.generalSetting.period;
                const dateQuery: any = {};
                
                if (startDate) dateQuery.$gte = startDate;
                if (endDate) dateQuery.$lte = endDate;
                
                if (Object.keys(dateQuery).length > 0) {
                    queryConditions["chartGeneralDetail.collectedDate"] = dateQuery;
                }
            }

            const partitionedData = await ChartDetailModel.find(queryConditions).lean();

            return {
                data: partitionedData,
                count: partitionedData.length
            };

        } catch (error) {
            console.error('Error in FilterChartDetail:', error);
            throw error;
        }
    }
}