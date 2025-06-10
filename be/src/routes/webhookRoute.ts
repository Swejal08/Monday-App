import { inputChangeController } from '@/controllers/webhookController';
import { Router } from 'express';
const router = Router();

router.get('/', (req, res) => {
  res.send(req.body);
});

router.post('/', inputChangeController);
export default router;
