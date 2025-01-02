import { Router } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import caseRoutes from './caseRoutes';
import healthRoutes from './healthRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/cases', caseRoutes);
router.use('/health', healthRoutes);

export default router; 