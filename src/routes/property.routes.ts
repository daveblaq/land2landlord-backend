import express from 'express';
import {
  createProperty,
  getProperty,
  updateProperty,
  deleteProperty,
  searchProperties,
  uploadPropertyImages,
  getPropertiesSitemap
} from '../controllers/property.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';

const router = express.Router();

/**
 * @openapi
 * /api/properties:
 *   post:
 *     tags:
 *       - Properties
 *     summary: Create a new property listing
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - propertyType
 *               - bedrooms
 *               - bathrooms
 *               - location
 *               - postcode
 *               - tenure
 *               - heroImage
 *               - investmentMetrics
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               propertyType:
 *                 type: string
 *                 enum: [flat, terraced, semi-detached, detached, maisonette, bungalow]
 *               bedrooms:
 *                 type: number
 *               bathrooms:
 *                 type: number
 *               location:
 *                 type: string
 *               postcode:
 *                 type: string
 *               tenure:
 *                 type: string
 *                 enum: [freehold, leasehold, share-of-freehold]
 *               heroImage:
 *                 type: string
 *               gallery:
 *                 type: array
 *                 items:
 *                   type: object
 *               investmentMetrics:
 *                 type: object
 *                 required:
 *                   - askingPrice
 *                   - monthlyRent
 *                 properties:
 *                   askingPrice:
 *                     type: number
 *                   monthlyRent:
 *                     type: number
 *                   leaseYearsRemaining:
 *                     type: number
 *               serviceCharge:
 *                 type: number
 *               groundRent:
 *                 type: number
 *               councilTaxBand:
 *                 type: string
 *                 enum: [A, B, C, D, E, F, G, H]
 *               tenented:
 *                 type: boolean
 *               tenancyStatus:
 *                 type: string
 *               tenantMoveInDate:
 *                 type: string
 *               contractType:
 *                 type: string
 *                 enum: [ast, non-ast, company-let, license]
 *               rentCollectionStatus:
 *                 type: string
 *                 enum: [agent-managed, direct-to-landlord, guaranteed]
 *               arrearsStatus:
 *                 type: string
 *                 enum: [no-arrears, historical-resolved, active-arrears]
 *               tenancyNotes:
 *                 type: string
 *               epc:
 *                 type: string
 *               floorplans:
 *                 type: array
 *                 items:
 *                   type: object
 *               propertyPacks:
 *                 type: array
 *                 items:
 *                   type: object
 *               complianceDocuments:
 *                 type: array
 *                 items:
 *                   type: object
 *               status:
 *                 type: string
 *                 enum: [draft, pending-review, published, under-offer, sold, archived]
 *               displayOnHomepage:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Property created successfully
 *       400:
 *         description: Bad request
 */
router.post('/', authenticateToken, authorizeRoles('admin', 'concierge'), createProperty);

/**
 * @openapi
 * /api/properties/upload:
 *   post:
 *     tags:
 *       - Properties
 *     summary: Upload property images (Admin/Concierge only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Images uploaded successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin or concierge role required
 */
router.post('/upload', authenticateToken, authorizeRoles('admin', 'concierge'), uploadPropertyImages);

/**
 * @openapi
 * /api/properties:
 *   get:
 *     tags:
 *       - Properties
 *     summary: Search and filter property listings
 *     parameters:
 *       - name: location
 *         in: query
 *         schema:
 *           type: string
 *       - name: minPrice
 *         in: query
 *         schema:
 *           type: number
 *       - name: maxPrice
 *         in: query
 *         schema:
 *           type: number
 *       - name: minRent
 *         in: query
 *         schema:
 *           type: number
 *       - name: maxRent
 *         in: query
 *         schema:
 *           type: number
 *       - name: minYield
 *         in: query
 *         schema:
 *           type: number
 *       - name: propertyType
 *         in: query
 *         schema:
 *           type: string
 *       - name: property_type
 *         in: query
 *         schema:
 *           type: string
 *       - name: bedrooms
 *         in: query
 *         schema:
 *           type: number
 *       - name: status
 *         in: query
 *         schema:
 *           type: string
 *       - name: sortBy
 *         in: query
 *         schema:
 *           type: string
 *           enum: [Newest, Highest Yield, Lowest Price, Highest Price]
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
 *         description: Search results retrieved successfully
 */
router.get('/', searchProperties);

/**
 * @openapi
 * /api/properties/sitemap:
 *   get:
 *     tags:
 *       - Properties
 *     summary: Retrieve published property slugs and timestamps for sitemap
 *     responses:
 *       200:
 *         description: Sitemap listings retrieved successfully
 */
router.get('/sitemap', getPropertiesSitemap);

/**
 * @openapi
 * /api/properties/{idOrSlug}:
 *   get:
 *     tags:
 *       - Properties
 *     summary: Retrieve a single property listing by ID or Slug
 *     parameters:
 *       - name: idOrSlug
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Property details retrieved successfully
 *       404:
 *         description: Property not found
 */
router.get('/:idOrSlug', getProperty);

/**
 * @openapi
 * /api/properties/{id}:
 *   patch:
 *     tags:
 *       - Properties
 *     summary: Update an existing property listing
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
 *     responses:
 *       200:
 *         description: Property updated successfully
 *       404:
 *         description: Property not found
 */
router.patch('/:id', authenticateToken, authorizeRoles('admin', 'concierge'), updateProperty);

/**
 * @openapi
 * /api/properties/{id}:
 *   delete:
 *     tags:
 *       - Properties
 *     summary: Delete a property listing
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Property deleted successfully
 *       404:
 *         description: Property not found
 */
router.delete('/:id', authenticateToken, authorizeRoles('admin', 'concierge'), deleteProperty);

export default router;
