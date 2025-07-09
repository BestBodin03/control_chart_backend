// apis.ts
import express from "express";
import { Router } from "express";
import flow00101TEST from "./api/v1/testApi";
import { API_V1_PREFIX } from "../config/constans";
import { createFurnace, getAllFurnaces } from "../controllers/FurnaceController";
import { processFromAPI, getAllCustomerProducts, getAllChartDetails, getEveryFurnaces  } from "../services/TestService";
import { getMasterData } from "../controllers/MasterDataController";

// import createDatabase from "./api/v1/createDatabase";

const router: Router = express.Router();
router.use(API_V1_PREFIX, flow00101TEST);
// router.use(API_V1_PREFIX, createDatabase);
// router.use(API_V1_PREFIX, getDatabase);
// router.use(API_V1_PREFIX, getMasterData);
// router.use(API_V1_PREFIX, addAllCollections);
router.post(`${API_V1_PREFIX}/furnace/add-with-master-data`, createFurnace);
// router.get(`${API_V1_PREFIX}/furnace-list`, getAllFurnaces);
router.get('/master-data', getMasterData);


router.get('/test/process-master-data', processFromAPI);
router.get('/test/furnaces', getEveryFurnaces);
router.get('/test/customer-products', getAllCustomerProducts);
router.get('/test/chart-details', getAllChartDetails);


export default router;