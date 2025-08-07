import { Router } from "express";
import { masterDataService, furnaceService, customerProductService, chartDetailService, masterDataController } from "../../../utils/serviceLocator";
import { MasterApiRequest } from "../../../models/MasterApiResponse";
import { autoCompleteEndDate } from "../../../utils/masterDataFGEncoder";

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
  await masterDataController.processFromAPI(req, res);
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