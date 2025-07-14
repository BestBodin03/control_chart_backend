import { SettingData } from "../models/Setting";
import { SettingService } from "../services/SettingService";
import {Request, Response} from 'express';
import { settingService } from "../utils/serviceLocator";

export class SettingController {
  constructor(settingService: SettingService) {}

  async createSetting(req: Request, res: Response): Promise<void> {
    try {
      const settingData: SettingData = req.body;
      
      const result = await settingService.createSettingProfile(settingData);
      
      res.status(201).json({
        success: true,
        message: 'Setting created successfully',
        data: result
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create setting'
      });
    }
  };

  async getAllSettings(req: Request, res: Response): Promise<void> {
    try {
      const result = await settingService.getAllSettingProfiles();
      
      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get settings'
      });
    }
  };
}