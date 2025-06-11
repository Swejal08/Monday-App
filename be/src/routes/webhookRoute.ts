import { inputChangeController } from '@/controllers/webhookController';
import { Router } from 'express';

const router = Router();

router.post('/', inputChangeController);

export default router;
