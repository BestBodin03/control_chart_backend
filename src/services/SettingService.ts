import mongoose, { ClientSession } from "mongoose";
import { SettingResponse, Setting, SettingModel } from "../models/entities/setting";
import { SettingRepository } from "../repositories/settingRepo";
import { PeriodType } from "../models/enums/periodType";
import { TimeConverter } from "../utils/timeConvertor";

export class SettingService {

  async createSettingProfile(settingData: SettingResponse): Promise<Setting> {
    try {
      // ✅ Use TimeConverter to get date range based on period type
      const enhancedSettingData = await this.updateSettingWithTimeConverter(settingData);

      // ✅ Deactivate other settings if this one is active
      if (enhancedSettingData.isUsed) {
        await SettingModel.updateMany(
          { isUsed: true },
          { $set: { isUsed: false } }
        );
      }

      const result = await SettingModel.create(enhancedSettingData);
      return result;

    } catch (error: any) {
      if (error.code === 11000) {
        throw new Error('Setting profile name already exists');
      }
      throw new Error(error.message || 'Failed to create setting profile');
    }
  }

  // ✅ Private method to use TimeConverter for date calculation per specificSetting item
  private async updateSettingWithTimeConverter(settingData: SettingResponse): Promise<SettingResponse> {
    const updatedSpecific = (settingData.specificSetting ?? []).map(item => {
      const periodType = item.period.type;

      // ✅ Skip this item if CUSTOM and already has both dates
      if (
        periodType === PeriodType.CUSTOM &&
        item.period.startDate &&
        item.period.endDate
      ) {
        return item;
      }

      // ✅ For ONE_MONTH, allow customDays inside the period (optional), default 30
      let pastDays: number | undefined;
      if (periodType === PeriodType.ONE_MONTH) {
        pastDays = (item.period as any).customDays ?? 30;
      }

      // ✅ Use TimeConverter utility to get date range for this item
      const dateRange = TimeConverter.toDateRange(
        periodType,
        item.period.startDate, // customStart for CUSTOM
        item.period.endDate,   // customEnd for CUSTOM
        pastDays               // for ONE_MONTH
      );

      return {
        ...item,
        period: {
          ...item.period,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        },
      };
    });

    // ✅ Return updated object: generalSetting stays as-is, only specificSetting updated
    return {
      ...settingData,
      specificSetting: updatedSpecific,
    };
  }


  async getAllSettingProfiles(): Promise<Setting[]> {
    try {
      const settings = await SettingModel
        .find({})
        .sort({ createdAt: -1 })
        .exec();

      return settings;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to retrieve setting profiles');
    }
  }

  async refreshSettingDates(settingId: string, newPeriodType?: PeriodType): Promise<Setting | null> {
    try {
      const existingSetting = await SettingModel.findById(settingId);
      if (!existingSetting) {
        throw new Error('Setting not found');
      }

      // ✅ Use new period type or existing one
      const periodType = newPeriodType || existingSetting.generalSetting.period.type;
      
      // ✅ Use TimeConverter to get fresh date range
      const dateRange = TimeConverter.toDateRange(periodType);

      const updatedSetting = await SettingModel.findByIdAndUpdate(
        settingId,
        {
          $set: {
            'generalSetting.period.type': periodType,
            'generalSetting.period.startDate': dateRange.startDate,
            'generalSetting.period.endDate': dateRange.endDate,
            updatedAt: new Date()
          }
        },
        { new: true }
      );

      return updatedSetting;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to refresh setting dates');
    }
  }

  async getSettingDateRange(settingId: string): Promise<{
    startDate: Date;
    endDate: Date;
  }> {
    try {
      const setting = await SettingModel.findById(settingId);
      if (!setting) {
        throw new Error('Setting not found');
      }

      // ✅ Use TimeConverter to get current date range
      const dateRange = TimeConverter.toDateRange(
        setting.generalSetting.period.type,
        setting.generalSetting.period.startDate,
        setting.generalSetting.period.endDate
      );

      return {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      };

    } catch (error: any) {
      throw new Error(error.message || 'Failed to get setting date range');
    }
  }

  async validatePeriodConfiguration(periodType: PeriodType, startDate?: Date, endDate?: Date): Promise<{
    isValid: boolean;
    dateRange?: { startDate: Date; endDate: Date };
    error?: string;
  }> {
    try {
      // ✅ Try to get date range using TimeConverter
      const dateRange = TimeConverter.toDateRange(periodType, startDate, endDate);

      return {
        isValid: true,
        dateRange
      };

    } catch (error: any) {
      return {
        isValid: false,
        error: error.message
      };
    }
  }

}