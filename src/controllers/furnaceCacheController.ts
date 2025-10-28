// controllers/furnaceCache.controller.ts
import { Request, Response } from "express";
import { z, ZodError } from "zod";
import { furnaceMaterialCacheService } from "../services/furnaceMaterialCacheService";

const searchQuerySchema = z.object({
  furnaceNo: z.coerce.string().optional(),
  cpNo: z.string().trim().min(1).optional(),
});

class FurnaceCacheController {
  async search(req: Request, res: Response): Promise<void> {
    const parsed = searchQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({
        status: "error",
        statusCode: 400,
        error: { message: "Validation failed", issues: parsed.error.issues },
      });
      return;
    }

    try {
      const { furnaceNo, cpNo } = parsed.data;

      // no params → return cache overview
      if (furnaceNo === undefined && cpNo === undefined) {
        res.status(200).json({
          status: "success",
          statusCode: 200,
          data: furnaceMaterialCacheService.getAll(),
        });
        return;
      }

      // query by furnaceNo → return furnaceNo + arrays: cpNo[], cpName[]
      if (typeof furnaceNo === "string") {
        const fn = parseInt(furnaceNo, 10);
        const cpList = furnaceMaterialCacheService.getCpByFurnace(fn); // string[]
        // map each cpNo to its name via cache
        const cpNameList = cpList.map(
          (cp) => furnaceMaterialCacheService.getCpName(cp) ?? ""
        );

        res.status(200).json({
          status: "success",
          statusCode: 200,
          data: { furnaceNo, cpNo: cpList, cpName: cpNameList },
        });
        return;
      }

      // query by cpNo → return cpNo + cpName + furnaces[]
      if (typeof cpNo === "string") {
        const furnaces = furnaceMaterialCacheService.getFurnacesByCp(cpNo);
        const cpName = furnaceMaterialCacheService.getCpName(cpNo) ?? "";

        res.status(200).json({
          status: "success",
          statusCode: 200,
          data: { cpNo, cpName, furnaces },
        });
        return;
      }

      res.status(400).json({
        status: "error",
        statusCode: 400,
        error: { message: "Provide either furnaceNo or cpNo" },
      });
    } catch (e: any) {
      if (res.headersSent) return;
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
        error: { message: e?.message ?? "Internal Server Error" },
      });
    }
  }

  async refresh(req: Request, res: Response): Promise<void> {
    try {
      await furnaceMaterialCacheService.refresh();
      res.status(200).json({
        status: "success",
        statusCode: 200,
        data: { message: "Cache refreshed" },
      });
    } catch (e: any) {
      if (res.headersSent) return;
      res.status(500).json({
        status: "error",
        statusCode: 500,
        error: { message: e?.message ?? "Internal Server Error" },
      });
    }
  }
}

export const furnaceCacheController = new FurnaceCacheController();
