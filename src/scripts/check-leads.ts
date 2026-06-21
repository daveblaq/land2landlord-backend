import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Lead } from '../models/lead.model';
import logger from '../utils/logger';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  logger.error('No MONGO_URI found in environment variables. Please check your .env file.');
  process.exit(1);
}

async function checkLeads() {
  try {
    await mongoose.connect(MONGO_URI!);
    logger.info('Connected to MongoDB.');

    const totalLeads = await Lead.countDocuments();
    logger.info(`Total leads in DB: ${totalLeads}`);

    const recentLeads = await Lead.find().sort({ createdAt: -1 }).limit(10);
    logger.info('Most recent 10 leads:');
    recentLeads.forEach(lead => {
      logger.info(`- ID: ${lead._id}, Name: ${lead.name}, Email: ${lead.email}, Type: ${lead.type}, Status: ${lead.status}, CreatedAt: ${lead.createdAt}`);
    });

  } catch (error) {
    logger.error(error, 'Error checking leads');
  } finally {
    await mongoose.disconnect();
  }
}

checkLeads();
