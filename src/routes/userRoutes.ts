import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware';
import { 
    getUserProfileController, 
    updateUserStatsController ,
    updateProfileImageController,
    removeProfileImageController
} from '../controllers/userController';
import multer from 'multer';

const router = Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

router.get('/profile', authenticate, getUserProfileController);
router.get('/stats', authenticate, updateUserStatsController);
router.post('/profile/image', authenticate, upload.single('image'), updateProfileImageController);
router.delete('/profile/image', authenticate, removeProfileImageController);

export default router;