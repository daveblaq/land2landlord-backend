import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Property } from '../models/property.model';
import logger from '../utils/logger';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  logger.error('No MONGO_URI found in environment variables. Please check your .env file.');
  process.exit(1);
}

async function backfillLocationGeo() {
  try {
    logger.info('Connecting to database...');
    await mongoose.connect(MONGO_URI!);
    logger.info('Connected to MongoDB.');

    const properties = await Property.find({
      latitude: { $exists: true, $ne: null },
      longitude: { $exists: true, $ne: null },
      location_geo: { $exists: false },
    });

    logger.info(`Found ${properties.length} properties with coordinates but no location_geo.`);

    let updated = 0;
    let skipped = 0;

    for (const property of properties) {
      if (
        typeof property.latitude === 'number' && !Number.isNaN(property.latitude) &&
        typeof property.longitude === 'number' && !Number.isNaN(property.longitude)
      ) {
        // Saving re-runs the pre-save hook, which sets location_geo from latitude/longitude
        await property.save();
        updated++;
      } else {
        skipped++;
      }
    }

    logger.info(`Backfill complete. Updated: ${updated}, Skipped (invalid coordinates): ${skipped}.`);
  } catch (error) {
    logger.error(error, 'Error backfilling location_geo');
  } finally {
    await mongoose.disconnect();
    logger.info('Database connection closed.');
  }
}

backfillLocationGeo();
