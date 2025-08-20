import { Router } from "express";
import { settingController } from "../../../controllers/setting/settingController";

const router = Router();

router.post("/setting/create", async (req, res) => {
  settingController.addSettingProfile(req, res);
});

export { router as settingRoutes };
