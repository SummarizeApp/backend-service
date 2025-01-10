import { Router, Request, Response } from 'express';
import { authenticate } from '../middlewares/authMiddleware';
import { isAdmin } from '../middlewares/authMiddleware';
import upload from '../middlewares/uploadMiddleware';
import { 
    getAllUsers, 
    deleteUser, 
    updateUserRole, 
    updateUser, 
    getDashboardStats,
} from '../controllers/adminController';
import { createCaseWithFileController } from '../controllers/caseController';
import axios from 'axios';

const router = Router();

/**
 * @swagger
 * /admin/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/dashboard/stats', authenticate, isAdmin, getDashboardStats);

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/users', authenticate, isAdmin, getAllUsers);

/**
 * @swagger
 * /admin/users/{userId}:
 *   delete:
 *     summary: Delete a user (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: User not found
 */
router.delete('/users/:userId', authenticate, isAdmin, deleteUser);

/**
 * @swagger
 * /admin/users/{userId}/role:
 *   patch:
 *     summary: Update user role (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *     responses:
 *       200:
 *         description: User role updated successfully
 *       400:
 *         description: Invalid role
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: User not found
 */
router.patch('/users/:userId/role', authenticate, isAdmin, updateUserRole);

/**
 * @swagger
 * /admin/users/{userId}:
 *   patch:
 *     summary: Update user details (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               contactNumber:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user, admin]
 *     responses:
 *       200:
 *         description: User updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: User not found
 */
router.patch('/users/:userId', authenticate, isAdmin, updateUser);

/**
 * @swagger
 * /admin/summarize-pdf:
 *   post:
 *     summary: Summarize a PDF file (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: PDF summarized successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.post('/summarize-pdf', authenticate, isAdmin, upload.single('file'), createCaseWithFileController);

/**
 * @swagger
 * /admin/proxy-pdf:
 *   get:
 *     summary: Proxy endpoint for downloading PDFs from AWS (Admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: url
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: PDF file streamed successfully
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Invalid URL or missing parameter
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *       500:
 *         description: Server error while fetching PDF
 */
router.get('/proxy-pdf', authenticate, isAdmin, async (req: Request, res: Response): Promise<void> => {
    const { url } = req.query;

    if (!url || typeof url !== 'string' || !url.startsWith('https://')) {
        res.status(400).json({ message: 'Geçersiz URL parametresi' });
        return;
    }

    try {
        const response = await axios({
            method: 'GET',
            url: url,
            responseType: 'stream',
            timeout: 30000,
            headers: {
                'Accept': 'application/pdf'
            }
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=document.pdf`);
        
        // Type assertion for stream data
        (response.data as any).pipe(res);
    } catch (error: any) {
        console.error('PDF proxy error:', error.message);
        
        // Daha detaylı hata mesajları
        if (error.response) {
            res.status(error.response.status).json({
                message: `AWS'den PDF alınamadı: ${error.response.statusText}`
            });
        } else if (error.request) {
            res.status(500).json({
                message: "AWS'ye bağlanılamadı"
            });
        } else {
            res.status(500).json({
                message: 'PDF indirme işlemi başarısız oldu'
            });
        }
    }
});

export default router; 