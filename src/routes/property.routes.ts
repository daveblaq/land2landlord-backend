import express from 'express';
import {
  createProperty,
  getProperty,
  updateProperty,
  deleteProperty,
  searchProperties,
  uploadPropertyImages,
  getPropertiesSitemap,
  getPropertyStats,
  getEpcLookup,
  createPropertiesBulk
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
 * /api/properties/bulk:
 *   post:
 *     tags:
 *       - Properties
 *     summary: Bulk create property listings from uploaded file rows (Admin/Concierge only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - properties
 *             properties:
 *               properties:
 *                 type: array
 *                 items:
 *                   type: object
 *                   description: Individual property fields to create (matches standard property structure)
 *     responses:
 *       201:
 *         description: Properties created successfully
 *       400:
 *         description: Validation failed or bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin or concierge role required
 */
router.post('/bulk', authenticateToken, authorizeRoles('admin', 'concierge'), createPropertiesBulk);

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
 *         description: Free-text location match. Ignored if lat/lng/radiusMiles are all supplied.
 *       - name: lat
 *         in: query
 *         schema:
 *           type: number
 *         description: Latitude of the search origin (used together with lng and radiusMiles for radius search)
 *       - name: lng
 *         in: query
 *         schema:
 *           type: number
 *         description: Longitude of the search origin (used together with lat and radiusMiles for radius search)
 *       - name: radiusMiles
 *         in: query
 *         schema:
 *           type: number
 *         description: Radius in miles for geospatial search around lat/lng. When omitted, falls back to text-based location matching.
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
 *       - name: createdBy
 *         in: query
 *         schema:
 *           type: string
 *         description: Filter properties by creator user ID
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
 * /api/properties/stats:
 *   get:
 *     tags:
 *       - Properties
 *     summary: Retrieve aggregate counts of properties grouped by status (Admin/Concierge only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: location
 *         in: query
 *         schema:
 *           type: string
 *         description: Filter stats by location
 *       - name: createdBy
 *         in: query
 *         schema:
 *           type: string
 *         description: Filter stats by creator user ID
 *     responses:
 *       200:
 *         description: Property stats retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin or concierge role required
 */
router.get('/stats', authenticateToken, authorizeRoles('admin', 'concierge'), getPropertyStats);
/**
 * @openapi
 * /api/properties/epc-lookup:
 *   get:
 *     tags:
 *       - Properties
 *     summary: Search government database for Energy Performance Certificates (EPC) (Admin/Concierge only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: postcode
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Postcode to search EPCs for
 *       - name: address
 *         in: query
 *         schema:
 *           type: string
 *         description: Optional address text match to filter results
 *     responses:
 *       200:
 *         description: EPC records matched and retrieved successfully
 *       400:
 *         description: Bad request - postcode query parameter missing
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin or concierge role required
 */
router.get('/epc-lookup', authenticateToken, authorizeRoles('admin', 'concierge'), getEpcLookup);

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
