import express from 'express';
import initMondayClient from 'monday-sdk-js';
import { DatabaseType, initializeDatabase } from './database/DatabaseFactory';
import { Item } from '@/database/models/Item';
import { CalculationLog } from '@/database/models/CalculationLog';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import compression from 'compression';
import morgan from 'morgan';
import webhookRoute from '@/routes/webhookRoute';
import itemsRoute from '@/routes/itemRoutes';
import {
  notFoundHandler,
  setupGlobalErrorHandlers,
} from '@/middleware/errorHandler';

const app = express();
const port = process.env.PORT || 8000;

// Load environment variables
require('dotenv').config();

setupGlobalErrorHandlers();

app.use(morgan('dev'));

app.use(compression());

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173'];

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'ngrok-skip-browser-warning',
      'X-Requested-With',
    ],
    credentials: false,
  })
);

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use('/webhook-input', webhookRoute);
app.use('/items', itemsRoute);

// app.use(errorHandler);

const gracefulShutdown = (signal) => {
  console.log(`Received ${signal}. Shutting down gracefully...`);

  mongoose.connection.close(false).then(() => {
    console.log('MongoDB connection closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

const startServer = async () => {
  try {
    await initializeDatabase(DatabaseType.MONGODB);

    const server = app.listen(port, () => {
      console.log(`🚀 Server is running on port ${port}`);
    });

    // Handle server errors
    server.on('error', (error) => {
      console.error('Server error:', error);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
