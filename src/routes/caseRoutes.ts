import { Router } from 'express';
import { createCaseWithFileController, downloadFileController, getUserCasesController } from '../controllers/caseController';
import upload from '../middlewares/uploadMiddleware';
import { authenticate } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validationMiddleware';
import { createCaseSchema } from '../validators/caseValidator';

const router = Router();

/**
 * @swagger
 * /cases:
 *   post:
 *     summary: Create a new case with a file
 *     tags: [Cases]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Case created and file uploaded successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticate, upload.single('file'), validate(createCaseSchema), createCaseWithFileController);

/**
 * @swagger
 * /cases/{caseId}/files/{fileName}:
 *   get:
 *     summary: Download a file from a case
 *     tags: [Cases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: caseId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the case
 *       - in: path
 *         name: fileName
 *         schema:
 *           type: string
 *         required: true
 *         description: The name of the file
 *     responses:
 *       200:
 *         description: File downloaded successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: File not found
 */
router.get('/:caseId/files/:fileName', authenticate, downloadFileController);

/**
 * @swagger
 * /cases:
 *   get:
 *     summary: Get all cases for the authenticated user
 *     tags: [Cases]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User cases fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticate, getUserCasesController);


export default router;