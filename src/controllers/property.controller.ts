import { Request, Response } from 'express';
import propertyService from '../services/property.service';
import catchAsync from '../utils/catchAsync';
import { createPropertyValidator, updatePropertyValidator } from '../validation/property.validate';
import { ZodError } from 'zod';
import httpStatus from 'http-status';
import { uploadToMedia } from '../utils/cloudinary';

/**
 * Create Property Listing
 */
export const createProperty = catchAsync(async (req: Request, res: Response) => {
  try {
    createPropertyValidator.parse(req.body);
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(httpStatus.BAD_REQUEST).json({
        status: httpStatus.BAD_REQUEST,
        message: err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '),
        data: null,
      });
    }
  }

  const property = await propertyService.createProperty(req.body);
  return res.status(httpStatus.CREATED).json({
    status: httpStatus.CREATED,
    message: 'Property listing created successfully',
    data: property,
  });
});

/**
 * Update Property Listing
 */
export const updateProperty = catchAsync(async (req: Request, res: Response) => {
  try {
    updatePropertyValidator.parse(req.body);
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(httpStatus.BAD_REQUEST).json({
        status: httpStatus.BAD_REQUEST,
        message: err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '),
        data: null,
      });
    }
  }

  const property = await propertyService.updatePropertyById(req.params.id, req.body);
  if (!property) {
    return res.status(httpStatus.NOT_FOUND).json({
      status: httpStatus.NOT_FOUND,
      message: 'Property listing not found',
      data: null,
    });
  }

  return res.status(httpStatus.OK).json({
    status: httpStatus.OK,
    message: 'Property listing updated successfully',
    data: property,
  });
});

/**
 * Get Property Detail by ID or Slug
 */
export const getProperty = catchAsync(async (req: Request, res: Response) => {
  const identifier = req.params.idOrSlug;
  let property;
  
  // Try querying by ID if it matches Mongoose ObjectId hex format, otherwise search by slug
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    property = await propertyService.getPropertyById(identifier);
  } else {
    property = await propertyService.getPropertyBySlug(identifier);
  }

  if (!property) {
    return res.status(httpStatus.NOT_FOUND).json({
      status: httpStatus.NOT_FOUND,
      message: 'Property listing not found',
      data: null,
    });
  }

  return res.status(httpStatus.OK).json({
    status: httpStatus.OK,
    message: 'Property listing retrieved successfully',
    data: property,
  });
});

/**
 * Delete Property Listing
 */
export const deleteProperty = catchAsync(async (req: Request, res: Response) => {
  const property = await propertyService.deletePropertyById(req.params.id);
  if (!property) {
    return res.status(httpStatus.NOT_FOUND).json({
      status: httpStatus.NOT_FOUND,
      message: 'Property listing not found',
      data: null,
    });
  }

  return res.status(httpStatus.OK).json({
    status: httpStatus.OK,
    message: 'Property listing deleted successfully',
    data: null,
  });
});

/**
 * Search and Filter Listings
 */
export const searchProperties = catchAsync(async (req: Request, res: Response) => {
  const options = {
    location: req.query.location as string,
    minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
    maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
    minRent: req.query.minRent ? Number(req.query.minRent) : undefined,
    maxRent: req.query.maxRent ? Number(req.query.maxRent) : undefined,
    minYield: req.query.minYield ? Number(req.query.minYield) : undefined,
    propertyType: (req.query.propertyType || req.query.property_type) as string,
    bedrooms: req.query.bedrooms ? Number(req.query.bedrooms) : undefined,
    status: req.query.status as string,
    sortBy: req.query.sortBy as any,
    limit: req.query.limit ? Number(req.query.limit) : undefined,
    page: req.query.page ? Number(req.query.page) : undefined,
    isFeatured: req.query.isFeatured === 'true' ? true : req.query.isFeatured === 'false' ? false : undefined,
  };

  const results = await propertyService.queryProperties(options);
  return res.status(httpStatus.OK).json({
    status: httpStatus.OK,
    message: 'Property search results retrieved successfully',
    data: results,
  });
});

/**
 * Upload Property Images to Cloudinary
 */
export const uploadPropertyImages = catchAsync(async (req: Request, res: Response) => {
  const { images } = req.body;
  if (!images || !Array.isArray(images)) {
    return res.status(httpStatus.BAD_REQUEST).json({
      status: httpStatus.BAD_REQUEST,
      message: 'Images array is required',
      data: null,
    });
  }

  if (images.length > 6) {
    return res.status(httpStatus.BAD_REQUEST).json({
      status: httpStatus.BAD_REQUEST,
      message: 'Cannot upload more than 6 images',
      data: null,
    });
  }

  try {
    const uploadPromises = images.map((base64Image: string, index: number) => {
      const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1e9)}`;
      return uploadToMedia(base64Image, `property_${uniqueSuffix}_${index}`);
    });

    const urls = await Promise.all(uploadPromises);

    return res.status(httpStatus.OK).json({
      status: httpStatus.OK,
      message: 'Images uploaded successfully',
      data: urls,
    });
  } catch (error: any) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      status: httpStatus.INTERNAL_SERVER_ERROR,
      message: error.message || 'Failed to upload images to Cloudinary',
      data: null,
    });
  }
});

/**
 * Retrieve all published listings' slugs and updatedAt dates for sitemap
 */
export const getPropertiesSitemap = catchAsync(async (req: Request, res: Response) => {
  const results = await propertyService.getPublishedPropertiesForSitemap();
  return res.status(httpStatus.OK).json({
    status: httpStatus.OK,
    message: 'Sitemap property listings retrieved successfully',
    data: results,
  });
});
