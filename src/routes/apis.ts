// apis.ts
import express, { Router } from "express";
import { API_V1_PREFIX } from "../config/constans";
import { masterDataRoutes } from "./api/v1/masterDataRoute";
import { settingRoutes } from "./api/v1/settingRoute";
import { periodFilterRoutes } from "./api/v1/filterDataWithSettingRoute";
import { chartDetailRoute } from "./api/v1/chartDetailRoute";
import { furnaceRoute } from "./api/v1/furnaceRoute";
import { customerProductRoute } from "./api/v1/customerProductRoute";

const router: Router = express.Router();

router.use(API_V1_PREFIX, masterDataRoutes);
router.use(API_V1_PREFIX, settingRoutes);
router.use(API_V1_PREFIX, periodFilterRoutes);
router.use(API_V1_PREFIX, chartDetailRoute);
router.use(API_V1_PREFIX, furnaceRoute);
router.use(API_V1_PREFIX, customerProductRoute);

export default router;