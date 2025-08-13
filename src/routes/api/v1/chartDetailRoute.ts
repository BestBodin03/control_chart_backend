import { Router } from "express";
import { chartDetailController } from "../../../utils/serviceLocator";

const router = Router();

router.get('/chart-details/calculate', chartDetailController.getFilterdDataForCalculate);
router.get('/all-chart-details', async (req, res) => {
  chartDetailController.getAllChartDetails(req, res);
});

export { router as chartDetailRoute };