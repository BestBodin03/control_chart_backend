import { Router } from 'express';
import { getMasterData } from '../../../controllers/masterDataController';

const router = Router();
router.get('/master-data', getMasterData);

export default router;