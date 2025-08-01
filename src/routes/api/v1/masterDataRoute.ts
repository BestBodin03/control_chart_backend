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
    await masterDataController.getAllFurnaces(req, res);
  } catch (error) {
    res.json({ 
      status: res.statusCode,
      error: 'Failed to get furnace' });
  }
});

router.get('/all-material-no', async (req, res) => {
  try {
    await masterDataController.getCustomerProducts(req, res);
  } catch (error) {
    res.json({ 
      status: res.statusCode,
      error: 'Failed to get material No.' });
  }
});

router.get('/test/chart-details', async (req, res) => {
  try{
    await masterDataController.getAllChartDetails(req, res);
  } catch (error) {
    res.json({ 
      status: res.statusCode,
      error: 'Failed to get chart detail' });
  }
  masterDataController.getAllChartDetails(req, res);
});

export { router as masterDataRoutes };