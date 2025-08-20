// controllers/setting.controller.ts
import { Request, Response } from "express";
import { SettingService } from "../../services/settingService";
import { createSettingProfileRequestSchema, updateSettingProfileRequestSchema } from "../../models/validations/settingValidate";

class SettingController {
  constructor(private readonly service: SettingService) {}

  async addSettingProfile(req: Request, res: Response): Promise<void> {
    try {
      const serviceDTO = createSettingProfileRequestSchema.parse(req.body);

      const result = await this.service.addSettingProfile(serviceDTO);

      res.json({
        status: "success",
        statusCode: res.statusCode,
        data: result,
      });
    }catch (e: any) {
        if (e.name === "ZodError") {
          res.status(400).json({ 
            status: "error", 
            statusCode: res.statusCode,
            error: { message: "Validation failed", issues: e.issues } });
        }
          res.status(500).json({ 
            status: "error",
            statusCode: 500, 
            error: { message: "Internal Server Error", } });
      }
  }

  async updateSettingProfile(req: Request, res: Response): Promise<void> {
    try {
      const serviceDTO = updateSettingProfileRequestSchema.parse(req.body);

      const result = await this.service.updateSettingProfile(serviceDTO);

      res.json({
        status: "success",
        statusCode: res.statusCode,
        data: result,
      });
    }catch (e: any) {
        if (e.name === "ZodError") {
          res.status(400).json({ 
            status: "error", 
            statusCode: res.statusCode,
            error: { message: "Validation failed", issues: e.issues } });
        }
          res.status(500).json({ 
            status: "error",
            statusCode: 500, 
            error: { message: "Internal Server Error", } });
      }
  }
}

export const settingController = new SettingController(new SettingService());
