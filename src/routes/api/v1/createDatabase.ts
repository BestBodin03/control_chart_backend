import { Router } from "express";
import express from "express";
import { createExamplePart } from "../../../controllers/part.controller";
import { createExampleSetting } from "../../../controllers/setting.controller";
import { createExampleWarning } from "../../../controllers/warning.controller";
import { createExampleControlChart } from "../../../controllers/controlChart.controller";



const router: Router = express.Router();

router.get('/create_database', async (req, res) => {
    createExamplePart
    createExampleSetting
    createExampleWarning
    createExampleControlChart
  res.json("Create Success Fully");
});



export default router;