import { Router } from 'express';
import { createCaseWithFileController } from '../controllers/caseController';
import upload from '../middlewares/uploadMiddleware';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

router.post('/cases', authenticate, upload.single('file'), createCaseWithFileController);

export default router;