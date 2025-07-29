import { Router, Request, Response } from "express";
import { periodFilterController } from "../../../utils/serviceLocator";

const router = Router();

// POST /api/period/filter
// Body: { "settingProfileName": "Q1 2024" }
// router.post('/filter', periodFilterController.filterBySettingProfile);
router.get('/chart-details/filter', (req, res) => 
  periodFilterController.getDynamicFiltering(req, res)
);

export { router as periodFilterRoutes };