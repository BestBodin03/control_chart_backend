import { Router } from "express";
import { masterDataController } from "../../../utils/serviceLocator";

const router = Router();

router.post('/master/process-master-data', async (req, res) => {
  masterDataController.processFromAPI(req, res);
});

router.post('/master/qc-report-data', async (req, res) => {
    masterDataController.getDataFromQcReport(req, res);
});

export { router as masterDataRoutes };