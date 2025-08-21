// controllers/setting.controller.ts
import { Request, Response } from "express";
import { SettingService } from "../../services/settingService";
import { createSettingProfileRequestSchema, deleteSettingProfileRequestSchema, objectIdSchema, updateSettingProfileRequestSchema } from "../../models/validations/settingValidate";
import { ZodError } from "zod";
import { settingService } from "../../utils/serviceLocator";

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
            error: { message: "Internal Server Error" } });
      }
  }

  async updateSettingProfile(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const serviceDTO = updateSettingProfileRequestSchema.parse(req.body);
      const result = await this.service.updateSettingProfile(id, serviceDTO);
      res.status(200).json({
        status: "success",
        statusCode: 200,
        data: result,
      });
      return;
    } catch (e) {
      if (e instanceof ZodError) {
        res.status(400).json({
          status: "error",
          statusCode: 400,
          error: { message: "Validation failed", issues: e.issues },
        });
        return;
      }
      console.error(e);

      res.status(500).json({
        status: "error",
        statusCode: 500,
        error: { message: "Internal Server Error", e},
      });
      return;
    }
  }

  async deleteSettingProfile(req: Request, res: Response): Promise<void> {
    try {
      const { ids } = deleteSettingProfileRequestSchema.parse(req.body);
      const result = await settingService.deleteSettingProfile(ids);
      res.status(200).json({ status: "success", statusCode: 200, data: result });
    } catch (e) {
      if (e instanceof ZodError) {
        res.status(400).json({ status: "error", statusCode: 400, error: { message: "Validation failed", issues: e.issues } });
        return;
      }
      res.status(500).json({ status: "error", statusCode: 500, error: { message: "Internal Server Error" } });
    }
  }

  async searchSettingProfile(req: Request, res: Response): Promise<void> {
    try {
    } catch (e) {
      if (e instanceof ZodError) {
        res.status(400).json({ status: "error", statusCode: 400, error: { message: "Validation failed", issues: e.issues } });
        return;
      }
      res.status(500).json({ status: "error", statusCode: 500, error: { message: "Internal Server Error" } });
    }
  }

  async findOneSettingProfile(req: Request, res: Response): Promise<void> {
    try {
      const { id } = objectIdSchema.parse(req.params);
      const result = await settingService.findOneSettingProfile(id);
      if (!result) {
        res.status(404).json({
          status: "error",
          statusCode: 404,
          error: { message: "Setting profile not found" },
        });
        return;
      }
      res.status(200).json({
        status: "success",
        statusCode: 200,
        data: result,
      });
    } catch (e) {
      if (e instanceof ZodError) {
        res.status(400).json({
          status: "error",
          statusCode: 400,
          error: { message: "Validation failed", issues: e.issues },
        });
        return;
      }
      res.status(500).json({
        status: "error",
        statusCode: 500,
        error: { message: "Internal Server Error" },
      });
    }
  }

  async findAllSettingProfiles (req: Request, res: Response): Promise<void> {
      try {

        const result = await settingService.findAllSettingProfiles();
      if (!result) {
        res.status(404).json({
          status: "error",
          statusCode: 404,
          error: { message: "Setting profile not found" },
        });
        return;
      }
      res.status(200).json({
        status: "success",
        statusCode: 200,
        data: result,
      });
    } catch (e) {
      res.status(500).json({
        status: "error",
        statusCode: 500,
        error: { message: "Internal Server Error" },
      });
    }
  }
}

export const settingController = new SettingController(new SettingService());
