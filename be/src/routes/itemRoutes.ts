import {
  getCalculationLogsController,
  getItemController,
  updateFactorController,
} from '@/controllers/itemController';
import { Router } from 'express';

const router = Router();

router.put('/:itemId/factor', updateFactorController);
router.get('/:itemId', getItemController);
router.get('/:itemId/logs', getCalculationLogsController);

export default router;
