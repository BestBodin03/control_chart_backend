import { Router } from "express";
import { masterDataService, furnaceService, customerProductService, chartDetailService, masterDataController } from "../../../utils/serviceLocator";
import { MasterApiRequest } from "../../../models/MasterApiResponse";

const router = Router();

/*
POST
{
    "DB":"",
    "MATCP":"24006947",
    "STARTyear":"2025",
    "STARTmonth":"01",
    "STARTday":"01",
    "ENDyear":"2025",
    "ENDmonth":"06",
    "ENDday":"31"
}
*/
router.post('/test/process-master-data', async (req, res) => {
  try {
    const service = masterDataService;
    
    // ⭐ ใช้ข้อมูลจาก req.body พร้อม fallback
    const masterReq: MasterApiRequest = {
      DB: req.body.DB || "",
      MATCP: req.body.MATCP || "",
      STARTyear: req.body.STARTyear || "",
      STARTmonth: req.body.STARTmonth || "",
      STARTday: req.body.STARTday || "",
      ENDyear: req.body.ENDyear || "",
      ENDmonth: req.body.ENDmonth || "",
      ENDday: req.body.ENDday || ""
    };

    const result = await service.getDataFromQcReport(masterReq);
    res.json({
      status: "success",
      data: result
    });
  } catch (error) {
    console.error('Router error:', error);
    res.status(500).json({ 
      status: "error",
      message: 'Failed to process master data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
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

router.post('/qc-report-data', async (req, res) => {
  try{
    masterDataController.getDataFromQcReport(req, res);
  } catch (error) {
    res.json({
      status: res.statusCode,
      error: 'Failed to get data from QC Report'
    })
  }
});

export { router as masterDataRoutes };