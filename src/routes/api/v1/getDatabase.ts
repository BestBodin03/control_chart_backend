import { Router } from "express";
import express from "express";
import { createExamplePart, getExamplePart } from "../../../controllers/part.controller";
import { createExampleSetting, getExampleSetting } from "../../../controllers/setting.controller";
import { createExampleWarning, getExampleWarning } from "../../../controllers/warning.controller";
import { createExampleControlChart, getExampleControlChart } from "../../../controllers/controlChart.controller";
import getExampleFurnace from "../../../controllers/furnace.controller";



const router: Router = express.Router();

router.get('/get_database', async (req, res) => {
    getExamplePart
    getExampleSetting
    getExampleWarning
    getExampleControlChart
  res.json("You got it");
});



export default router;