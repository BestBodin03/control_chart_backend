import { customerProductController, masterDataController } from "../../../utils/serviceLocator";
import { Router } from "express";

const router = Router();

router.get('/all-material-no', async (req, res) => {
  customerProductController.getCustomerProducts(req, res);
});

export { router as customerProductRoute };