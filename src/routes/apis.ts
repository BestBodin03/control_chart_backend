// apis.ts
import express, { Router } from "express";
import { API_V1_PREFIX } from "../config/constans";
import { masterDataRoutes } from "./api/v1/masterDataRoute";

// import createDatabase from "./api/v1/createDatabase";

const router: Router = express.Router();
// router.use(API_V1_PREFIX, createDatabase);
// router.use(API_V1_PREFIX, getDatabase);
// router.use(API_V1_PREFIX, getMasterData);
// router.use(API_V1_PREFIX, addAllCollections);
// router.get(`${API_V1_PREFIX}/furnace-list`, getAllFurnaces);
// router.get('/master-data', getMasterData);


router.use(API_V1_PREFIX, masterDataRoutes);
// router.get('/test/furnaces', getEveryFurnaces);
// router.get('/test/customer-products', getAllCustomerProducts);
// router.get('/test/chart-details', getAllChartDetails);


export default router;