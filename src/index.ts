import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDb from './utils/connect';
import mongoose from 'mongoose';
import routes from './routes/index.routes';
import logger from './utils/logger';
import swaggerDocs from './utils/swagger';

// Initialize dotenv
dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 4000;

// Middleware to parse JSON for all other routes
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

// Set strictQuery to false to prepare for Mongoose 7
mongoose.set('strictQuery', false);

// Connect app to MongoDB
connectDb();

// Use the auth router
app.get('/', (req, res) => {
  res.status(200).json({
    status: 200,
    message: 'Welcome to the API',
  });
});

app.use('/api', routes);

app.listen(port, () => {
  logger.info(`Backend is running on port ${port}`);
  swaggerDocs(app, port);
});