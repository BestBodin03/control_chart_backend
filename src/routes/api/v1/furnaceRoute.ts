import { Router } from 'express';
import { furnaceController } from '../../../utils/serviceLocator';

const router = Router();

router.get('/all-furnaces', async (req, res) => {
  furnaceController.getAllFurnaces(req, res);
});

export { router as furnaceRoute };