import { Response, Request, NextFunction } from "express";
import { ChartDetailModel } from "../models/ChartDetail";
import { DataPartitionwithPeriod } from "../utils/dataPartitionwithPeriod";
import { SettingModel } from "../models/Setting";

export class PeriodFilterController {
  
  // ✅ Instance method แทน static method
  async filterBySettingProfile(req: Request, res: Response, nex: NextFunction): Promise<void> {
    try {
      const { settingProfileName } = req.body;
      
      // Validation
      if (!settingProfileName) {
        res.status(400).json({
          success: false,
          message: 'settingProfileName is required'
        });
        return;
      }

      console.log(`Searching for period: ${settingProfileName}`);

      // Step 1: ดึง period information จาก settings collection
      const periodInfo = await DataPartitionwithPeriod.getDateBySettingProfileName(settingProfileName);
      
      console.log(`✅ Period found:`, periodInfo);

      // Step 2: Get data filtered by period
      const filteredData = await DataPartitionwithPeriod.makeDataPartitionWithDate(periodInfo);

      console.log(`📊 Partitioned by period ${filteredData.count} chart details`);

      // Step 3: Apply additional filtering on the period-filtered data
      const setting = await SettingModel.findOne({ settingProfileName });
      const finalFilterdData = await DataPartitionwithPeriod.FilterChartDetail(setting!, filteredData.data!);
      // Response
      res.json({
        success: true,
        message: `Found ${finalFilterdData.count} chart details for period '${settingProfileName}'`,
        data: {
          chartDetails: finalFilterdData.data,
          count: finalFilterdData.count
        }
      });

    } catch (error) {
      console.error('❌ Error in filterBySettingProfile:', error);
      
      res.status(500).json({
        success: false,
        message: error || 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }
}