import { Router } from "express";
import { chartDetailController } from "../../../utils/serviceLocator";
import { GetCurrentChartDetailController } from "../../../controllers/getCurrentChartDetailController";

const router = Router();
const ctrl = new GetCurrentChartDetailController();

router.get('/chart-details/calculate', chartDetailController.getFilterdDataForCalculate);
router.get('/all-chart-details', async (req, res) => {
  chartDetailController.getAllChartDetails(req, res);
});

// Start bulk (loop cpNo) — GET /api/current-chart/process
router.get('/current-chart-details/process', (req, res) => ctrl.getCurrentChartDetail(req, res));

// Poll progress — GET /api/current-chart/progress
router.get('/current-chart-details/progress', (req, res) => ctrl.getProgress(req, res));

// // Cancel job — GET /api/current-chart/cancel
// router.get('/cancel', (req, res) => ctrl.cancel(req, res));

export { router as chartDetailRoute };