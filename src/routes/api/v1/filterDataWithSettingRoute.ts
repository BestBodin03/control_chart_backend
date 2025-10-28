import { Router, Request, Response } from "express";
import { periodFilterController } from "../../../utils/serviceLocator";

const router = Router();

router.get('/chart-details/filter', (req, res) => 
  periodFilterController.getDynamicFiltering(req, res)
);

export { router as periodFilterRoutes };