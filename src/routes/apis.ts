import express from "express";
import { Router } from "express";
import flow00101TEST from "./api/v1/testApi";
import { API_V1_PREFIX } from "../config/constans";
// import createDatabase from "./api/v1/createDatabase";
import getDatabase from "./api/v1/getDatabase";

const router: Router = express.Router();
router.use(API_V1_PREFIX, flow00101TEST);
// router.use(API_V1_PREFIX, createDatabase);
router.use(API_V1_PREFIX, getDatabase);

export default router;