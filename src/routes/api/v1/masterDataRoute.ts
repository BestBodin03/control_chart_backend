import { Router } from "express";
import { ChartDetailService } from "../../../services/ChartDetailService";
import { CustomerProductService } from "../../../services/CustomerProductService";
import { FurnaceService } from "../../../services/FurnaceService";
import { MasterDataService } from "../../../services/MasterDataService";


const router = Router();
router.get('/test/process-master-data', async (req, res) => {
  try {
    const service = new MasterDataService(
      new FurnaceService(furnaceRepository),
      new CustomerProductService(),
      new ChartDetailService()
    );
    const result = await service.processFromAPI();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to process master data' });
  }
});

router.get('/test/furnaces', async (req, res) => {
  try {
    const service = new FurnaceService();
    const result = await service.getAllFurnaces();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get furnaces' });
  }
});

router.get('/test/customer-products', async (req, res) => {
  try {
    const service = new CustomerProductService();
    const result = await service.getAllCustomerProducts();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get customer products' });
  }
});

router.get('/test/chart-details', async (req, res) => {
  try {
    const service = new ChartDetailService();
    const result = await service.getAllChartDetails();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get chart details' });
  }
});

export { router as masterRoutes };