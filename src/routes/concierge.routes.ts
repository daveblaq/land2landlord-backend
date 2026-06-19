import express from 'express';
import {
  getConcierges,
  createConcierge,
  updateConcierge,
  deleteConcierge,
} from '../controllers/concierge.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';

const router = express.Router();

router.use(authenticateToken);
router.use(authorizeRoles('admin'));

/**
 * @openapi
 * /api/concierges:
 *   get:
 *     tags:
 *       - Concierges
 *     summary: Retrieve all concierge accounts (Admin-only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Concierges retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin role required
 */
router.get('/', getConcierges);

/**
 * @openapi
 * /api/concierges:
 *   post:
 *     tags:
 *       - Concierges
 *     summary: Create a new concierge account (Admin-only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullname
 *               - email
 *               - country
 *             properties:
 *               fullname:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               country:
 *                 type: string
 *     responses:
 *       201:
 *         description: Concierge created successfully
 *       400:
 *         description: Bad request - invalid data or email already taken
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin role required
 */
router.post('/', createConcierge);

/**
 * @openapi
 * /api/concierges/{id}:
 *   patch:
 *     tags:
 *       - Concierges
 *     summary: Update concierge details or status (Admin-only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
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
 *               fullname:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               country:
 *                 type: string
 *               status:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Concierge updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin role required
 *       404:
 *         description: Concierge not found
 */
router.patch('/:id', updateConcierge);

/**
 * @openapi
 * /api/concierges/{id}:
 *   delete:
 *     tags:
 *       - Concierges
 *     summary: Delete a concierge account (Admin-only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Concierge deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin role required
 *       404:
 *         description: Concierge not found
 */
router.delete('/:id', deleteConcierge);

export default router;
