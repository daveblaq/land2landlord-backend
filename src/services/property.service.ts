import { Property, IProperty } from '../models/property.model';

export interface PropertyQueryOptions {
  location?: string;
  lat?: number;
  lng?: number;
  radiusMiles?: number;
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
  createdBy?: string;
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
  return Property.findById(id).populate('createdBy', 'fullname email role');
};

/**
 * Get property by slug
 */
const getPropertyBySlug = async (slug: string): Promise<IProperty | null> => {
  return Property.findOne({ slug }).populate('createdBy', 'fullname email role');
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

  // Creator Filter
  if (options.createdBy) {
    filter.createdBy = options.createdBy;
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

  // Location Filter: radius geo query (when lat/lng/radiusMiles all supplied) takes
  // precedence over plain text matching; otherwise fall back to regex on `location`
  // or `address` (so a full street address selected from a suggestion still matches).
  const hasGeoQuery =
    options.lat !== undefined && !Number.isNaN(options.lat) &&
    options.lng !== undefined && !Number.isNaN(options.lng) &&
    options.radiusMiles !== undefined && !Number.isNaN(options.radiusMiles);

  if (hasGeoQuery) {
    const EARTH_RADIUS_MILES = 3963.2;
    filter.location_geo = {
      $geoWithin: {
        $centerSphere: [[options.lng, options.lat], options.radiusMiles! / EARTH_RADIUS_MILES],
      },
    };
  } else if (options.location) {
    const locationRegex = { $regex: options.location, $options: 'i' };
    filter.$or = [{ location: locationRegex }, { address: locationRegex }];
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
  const limit = options.limit !== undefined && options.limit >= 0 ? options.limit : 10;
  const page = options.page && options.page > 0 ? options.page : 1;

  const totalResults = await Property.countDocuments(filter);
  
  let results;
  if (limit === 0) {
    results = await Property.find(filter)
      .sort(sort)
      .populate('createdBy', 'fullname email role');
  } else {
    const skip = (page - 1) * limit;
    results = await Property.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'fullname email role');
  }

  return {
    results,
    page,
    limit,
    totalPages: limit === 0 ? 1 : Math.ceil(totalResults / limit),
    totalResults,
  };
};

/**
 * Get all published properties with only slugs and updatedAt dates for sitemap
 */
const getPublishedPropertiesForSitemap = async () => {
  return Property.find({ status: 'published' }, 'slug updatedAt');
};

/**
 * Get property counts/stats aggregated by status
 */
const getPropertyStats = async (filter: any): Promise<Record<string, number>> => {
  const stats = await Property.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const statuses = ['draft', 'pending-review', 'published', 'under-offer', 'sold', 'archived'];
  const data = Object.fromEntries(statuses.map((s) => [s, 0]));

  stats.forEach((item) => {
    if (item._id && statuses.includes(item._id)) {
      data[item._id] = item.count;
    }
  });

  return data;
};

const propertyService = {
  createProperty,
  getPropertyById,
  getPropertyBySlug,
  updatePropertyById,
  deletePropertyById,
  queryProperties,
  getPublishedPropertiesForSitemap,
  getPropertyStats,
};

export default propertyService;
