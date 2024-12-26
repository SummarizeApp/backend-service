import { Router } from 'express';
import { createCaseWithFileController } from '../controllers/caseController';
import upload from '../middlewares/uploadMiddleware';
import { authenticate } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validationMiddleware';
import { createCaseSchema } from '../validators/caseValidator';

const router = Router();

router.post('/cases', authenticate, upload.single('file'), validate(createCaseSchema), createCaseWithFileController);

export default router;