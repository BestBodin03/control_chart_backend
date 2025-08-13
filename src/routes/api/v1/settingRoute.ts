import { Router } from "express";
import { settingService } from "../../../utils/serviceLocator";

const router = Router();

router.post('/settings', async (req, res) => {
  settingService.createSettingProfile(req.body);
});

router.get('/settings', async (req, res) => {
  settingService.getAllSettingProfiles();
});

export { router as settingRoutes };