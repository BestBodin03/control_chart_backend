import { SettingService } from "../../services/settingService";
import {Request, Response} from 'express';
import { settingService } from "../../utils/serviceLocator";
import { SettingResponse } from "./settingResponse";

export class SettingController {
  constructor(settingService: SettingService) {}

  async createSetting(req: Request, res: Response): Promise<void> {
    try {
      const settingData: SettingResponse = req.body;
      
      const result = await settingService.createSettingProfile(settingData);
      
      res.json({
          status: "success",
          statusCode: res.statusCode,
          data: result
      });
    } catch (e: any) {
        res.json({
            status: "error",
            statusCode: res.statusCode,
            error: {
            message: e.message,
            path: req.originalUrl,
            timeStamp: Date.now()
            }
        });
      }
  };

  async updateSetting(req: Request, res: Response) {

  }

  async deleteSetting(req: Request, res: Response): Promise<void> {

  }


  async getAllSettings(req: Request, res: Response): Promise<void> {
    try {
      const result = await settingService.getAllSettingProfiles();
      
      res.json({
          status: "success",
          statusCode: res.statusCode,
          result
      });
    } catch (e: any) {
        res.json({
            status: "error",
            statusCode: res.statusCode,
            error: {
            message: e.message,
            path: req.originalUrl,
            timeStamp: Date.now()
            }
        });
    }
  };
}