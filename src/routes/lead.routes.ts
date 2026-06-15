import express from 'express';
import {
  createLead,
  getLead,
  updateLead,
  getLeads
} from '../controllers/lead.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';

const router = express.Router();

/**
 * @openapi
 * /api/leads:
 *   post:
 *     tags:
 *       - Leads
 *     summary: Submit a new lead (Property Enquiry, Mortgage, Insurance, Valuation, General)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - type
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [Property Enquiry, Mortgage Lead, Insurance Lead, Valuation Lead, General Enquiry]
 *               message:
 *                 type: string
 *               metadata:
 *                 type: object
 *     responses:
 *       201:
 *         description: Lead submitted and routed successfully
 *       400:
 *         description: Bad request
 */
router.post('/', createLead);

/**
 * @openapi
 * /api/leads:
 *   get:
 *     tags:
 *       - Leads
 *     summary: Get all leads with pagination (Dashboard View)
 *     parameters:
 *       - name: type
 *         in: query
 *         schema:
 *           type: string
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *       - name: email
 *         in: query
 *         schema:
 *           type: string
 *       - name: limit
 *         in: query
 *         schema:
 *           type: number
 *       - name: page
 *         in: query
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Leads retrieved successfully
 */
router.get('/', authenticateToken, authorizeRoles('admin', 'concierge'), getLeads);

/**
 * @openapi
 * /api/leads/{id}:
 *   get:
 *     tags:
 *       - Leads
 *     summary: Retrieve details of a single lead by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lead details retrieved successfully
 *       404:
 *         description: Lead not found
 */
router.get('/:id', authenticateToken, authorizeRoles('admin', 'concierge'), getLead);

/**
 * @openapi
 * /api/leads/{id}:
 *   patch:
 *     tags:
 *       - Leads
 *     summary: Update status or message of a lead (Triage Action)
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
 *               status:
 *                 type: string
 *                 enum: [New, Contacted, Qualified, Viewing Scheduled, Negotiating, Closed]
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Lead updated successfully
 *       404:
 *         description: Lead not found
 */
router.patch('/:id', authenticateToken, authorizeRoles('admin', 'concierge'), updateLead);

export default router;
