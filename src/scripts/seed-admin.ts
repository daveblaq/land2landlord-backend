import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/user.model';
import { UserTypes } from '../enums/user';
import logger from '../utils/logger';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  logger.error('No MONGO_URI found in environment variables. Please check your .env file.');
  process.exit(1);
}

async function seedAdmin() {
  try {
    logger.info('Connecting to database...');
    await mongoose.connect(MONGO_URI!);
    logger.info('Connected to MongoDB.');

    const adminEmail = 'o.davecodes@gmail.com';
    const existingUser = await User.findOne({ email: adminEmail });

    if (existingUser) {
      logger.info(`User ${adminEmail} already exists. Updating role to 'admin'...`);
      existingUser.role = UserTypes.ADMIN;
      existingUser.isEmailVerified = true;
      existingUser.status = true;
      await existingUser.save();
      logger.info('User successfully updated to admin role.');
    } else {
      logger.info(`Creating new admin user: ${adminEmail}...`);
      await User.create({
        fullname: 'David Olatunji',
        username: 'davecodes',
        email: adminEmail,
        password: 'password123',
        country: 'Nigeria',
        role: UserTypes.ADMIN,
        isVIP: false,
        vipType: 'none',
        isEmailVerified: true,
        status: true,
      });
      logger.info('Admin user successfully created.');
    }
  } catch (error) {
    logger.error(error, 'Error seeding admin user');
  } finally {
    await mongoose.disconnect();
    logger.info('Database connection closed.');
  }
}

seedAdmin();
