import { Router } from "express";
import { masterDataService, furnaceService, customerProductService, chartDetailService, masterDataController } from "../../../utils/serviceLocator";

const router = Router();

router.get('/test/process-master-data', async (req, res) => {
  try {
    const service = masterDataService;
    const result = await service.processFromAPI();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to process master data' });
  }
});

router.get('/all-furnaces', async (req, res) => {
  try {
    const service = furnaceService;
    const result = await service.getAllFurnaces();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get furnaces' });
  }
});

router.get('/all-material-no', async (req, res) => {
  try {
    const service = customerProductService;
    const result = await service.getAllCustomerProducts();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get customer products' });
  }
});

router.get('/test/chart-details', async (req, res) => {
  masterDataController.getAllChartDetails(req, res);
});

export { router as masterDataRoutes };