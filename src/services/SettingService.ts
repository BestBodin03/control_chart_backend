import mongoose, { ClientSession } from "mongoose";
import { SettingData, ISetting, SettingModel } from "../models/Setting";
import { SettingRepository } from "../repositories/SettingRepo";
import { PeriodType } from "../models/enums/PeriodType";
import { TimeConverter } from "../utils/timeConvertor";

export class SettingService {

  async createSettingProfile(settingData: SettingData): Promise<ISetting> {
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

  // ✅ Private method to use TimeConverter for date calculation
  private async updateSettingWithTimeConverter(settingData: SettingData): Promise<SettingData> {
    const periodType = settingData.generalSetting.period.type;
    
    // ✅ Skip if CUSTOM type and already has both dates
    if (periodType === PeriodType.CUSTOM && 
        settingData.generalSetting.period.startDate && 
        settingData.generalSetting.period.endDate) {
      return settingData;
    }

    // ✅ For PAST_MONTH, check if customDays is provided in the period object
    let pastDays: number | undefined;
    if (periodType === PeriodType.PAST_MONTH) {
      // You can extend the interface to include customDays if needed
      pastDays = (settingData.generalSetting.period as any).customDays || 30;
    }

    try {
      // ✅ Use TimeConverter utility to get date range
      const dateRange = TimeConverter.toDateRange(
        periodType,
        settingData.generalSetting.period.startDate, // customStart for CUSTOM type
        settingData.generalSetting.period.endDate,   // customEnd for CUSTOM type
        pastDays // for PAST_MONTH type
      );

      // ✅ Return enhanced setting data with calculated dates
      return {
        ...settingData,
        generalSetting: {
          ...settingData.generalSetting,
          period: {
            ...settingData.generalSetting.period,
            startDate: dateRange.startDate,
            endDate: dateRange.endDate
          }
        }
      };

    } catch (error: any) {
      // ✅ If TimeConverter fails, throw descriptive error
      throw new Error(`Failed to calculate date range for period type '${periodType}': ${error.message}`);
    }
  }

  async getAllSettingProfiles(): Promise<ISetting[]> {
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

  // ✅ Method to refresh dates for existing setting using TimeConverter
  async refreshSettingDates(settingId: string, newPeriodType?: PeriodType): Promise<ISetting | null> {
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

  // ✅ Method to get current effective date range for a setting
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

  // ✅ Method to validate period configuration using TimeConverter
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