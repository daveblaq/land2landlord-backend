import mongoose from 'mongoose';
import logger from './logger';

function connectDb() {
  return mongoose
    .connect(process.env.MONGO_URI!)
    .then(() => logger.info('Connected to MongoDB'))
    .catch((err) => logger.error(err));
}

export default connectDb;