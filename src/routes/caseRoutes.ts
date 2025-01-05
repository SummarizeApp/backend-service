import { Router } from 'express';
import { createCaseWithFileController, downloadFileController, getUserCasesController, deleteCasesController, getCaseStatsController } from '../controllers/caseController';
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

/**
 * @swagger
 * /cases/delete:
 *   post:
 *     summary: Delete one or multiple cases
 *     tags: [Cases]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               caseIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 minItems: 1
 *             required:
 *               - caseIds
 *           examples:
 *             single:
 *               value:
 *                 caseIds: ["6457b8c7a2f2d3c3d4e5f6g7"]
 *             multiple:
 *               value:
 *                 caseIds: ["6457b8c7a2f2d3c3d4e5f6g7", "7457b8c7a2f2d3c3d4e5f6g8"]
 *     responses:
 *       200:
 *         description: Case(s) deleted successfully
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: One or more cases not found
 */
router.post('/delete', authenticate, deleteCasesController);

/**
 * @swagger
 * /cases/stats:
 *   get:
 *     summary: Get case statistics for the authenticated user
 *     tags: [Cases]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Case statistics fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/stats', authenticate, getCaseStatsController);

export default router;