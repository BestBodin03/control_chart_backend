import { Router, Request, Response } from "express";
import { chartDetailController, periodFilterController } from "../../../utils/serviceLocator";

const router = Router();

// POST /api/period/filter
// Body: { "settingProfileName": "Q1 2024" }
router.get('/chart-details/calculate', chartDetailController.getFilterdDataForCalculate);
// router.get('/chart-details/filter', (req, res) => 
//   periodFilterController.getDynamicFiltering(req, res)
// );

export { router as chartDetailRoute };