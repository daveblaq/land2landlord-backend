import { Property, IProperty } from '../models/property.model';

export interface PropertyQueryOptions {
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  minRent?: number;
  maxRent?: number;
  minYield?: number;
  propertyType?: string;
  bedrooms?: number;
  status?: string;
  sortBy?: 'Newest' | 'Highest Yield' | 'Lowest Price' | 'Highest Price';
  limit?: number;
  page?: number;
  isFeatured?: boolean;
}

/**
 * Create a new property
 */
const createProperty = async (propertyBody: Partial<IProperty>): Promise<IProperty> => {
  return Property.create(propertyBody);
};

/**
 * Get property by ID
 */
const getPropertyById = async (id: string): Promise<IProperty | null> => {
  return Property.findById(id);
};

/**
 * Get property by slug
 */
const getPropertyBySlug = async (slug: string): Promise<IProperty | null> => {
  return Property.findOne({ slug });
};

/**
 * Update property by ID
 */
const updatePropertyById = async (id: string, updateBody: Partial<IProperty>): Promise<IProperty | null> => {
  const property = await Property.findById(id);
  if (!property) {
    return null;
  }

  // Handle nested investmentMetrics merge manually
  if (updateBody.investmentMetrics) {
    property.investmentMetrics = {
      ...property.investmentMetrics,
      ...updateBody.investmentMetrics
    };
    delete updateBody.investmentMetrics;
  }

  Object.assign(property, updateBody);
  await property.save();
  return property;
};

/**
 * Delete property by ID
 */
const deletePropertyById = async (id: string): Promise<IProperty | null> => {
  return Property.findByIdAndDelete(id);
};

/**
 * Search and Filter properties
 */
const queryProperties = async (options: PropertyQueryOptions) => {
  const filter: any = {};

  // Featured Filter
  if (options.isFeatured !== undefined) {
    filter.isFeatured = options.isFeatured;
  }

  // Status Filter
  if (options.status) {
    if (options.status !== 'all') {
      filter.status = options.status;
    }
  } else {
    // Default to published listings for public buyers
    filter.status = 'published';
  }

  // Location Filter (Regex case-insensitive)
  if (options.location) {
    filter.location = { $regex: options.location, $options: 'i' };
  }

  // Asking Price range
  if (options.minPrice !== undefined || options.maxPrice !== undefined) {
    filter['investmentMetrics.askingPrice'] = {};
    if (options.minPrice !== undefined) {
      filter['investmentMetrics.askingPrice'].$gte = options.minPrice;
    }
    if (options.maxPrice !== undefined) {
      filter['investmentMetrics.askingPrice'].$lte = options.maxPrice;
    }
  }

  // Monthly Rent range
  if (options.minRent !== undefined || options.maxRent !== undefined) {
    filter['investmentMetrics.monthlyRent'] = {};
    if (options.minRent !== undefined) {
      filter['investmentMetrics.monthlyRent'].$gte = options.minRent;
    }
    if (options.maxRent !== undefined) {
      filter['investmentMetrics.monthlyRent'].$lte = options.maxRent;
    }
  }

  // Yield range
  if (options.minYield !== undefined) {
    filter['investmentMetrics.grossYield'] = { $gte: options.minYield };
  }

  // Property Type
  if (options.propertyType) {
    filter.propertyType = { $regex: options.propertyType, $options: 'i' };
  }

  // Bedrooms
  if (options.bedrooms !== undefined) {
    filter.bedrooms = options.bedrooms;
  }

  // Sorting
  let sort: any = { isFeatured: -1, createdAt: -1 }; // Default: Featured first, then newest
  if (options.sortBy) {
    switch (options.sortBy) {
      case 'Highest Yield':
        sort = { isFeatured: -1, 'investmentMetrics.grossYield': -1, createdAt: -1 };
        break;
      case 'Lowest Price':
        sort = { isFeatured: -1, 'investmentMetrics.askingPrice': 1, createdAt: -1 };
        break;
      case 'Highest Price':
        sort = { isFeatured: -1, 'investmentMetrics.askingPrice': -1, createdAt: -1 };
        break;
      case 'Newest':
      default:
        sort = { isFeatured: -1, createdAt: -1 };
        break;
    }
  }

  // Pagination
  const limit = options.limit && options.limit > 0 ? options.limit : 10;
  const page = options.page && options.page > 0 ? options.page : 1;
  const skip = (page - 1) * limit;

  const totalResults = await Property.countDocuments(filter);
  const results = await Property.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit);

  return {
    results,
    page,
    limit,
    totalPages: Math.ceil(totalResults / limit),
    totalResults,
  };
};

/**
 * Get all published properties with only slugs and updatedAt dates for sitemap
 */
const getPublishedPropertiesForSitemap = async () => {
  return Property.find({ status: 'published' }, 'slug updatedAt');
};

const propertyService = {
  createProperty,
  getPropertyById,
  getPropertyBySlug,
  updatePropertyById,
  deletePropertyById,
  queryProperties,
  getPublishedPropertiesForSitemap,
};

export default propertyService;
