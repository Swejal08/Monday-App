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
  errorHandler,
  notFoundHandler,
  setupGlobalErrorHandlers,
} from '@/middleware/errorHandler';

const app = express();
const port = process.env.PORT || 8000;

// Load environment variables
require('dotenv').config();

// Setup global error handlers for uncaught exceptions and unhandled rejections
setupGlobalErrorHandlers();

// Rate Limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
//   message: {
//     error: 'Too many requests from this IP, please try again later.',
//   },
//   standardHeaders: true,
//   legacyHeaders: false,
// });

// const webhookLimiter = rateLimit({
//   windowMs: 1 * 60 * 1000, // 1 minute
//   max: 50, // limit webhook endpoints to 50 requests per minute
//   message: {
//     error: 'Too many webhook requests, please try again later.',
//   },
// });

// app.use(limiter);

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

// app.use(mongoSanitize());

// // Security middleware for sensitive routes
// const authMiddleware = (req, res, next) => {
//   const apiKey = req.headers['x-api-key'];
//   const expectedApiKey = process.env.API_KEY;

//   if (expectedApiKey && apiKey !== expectedApiKey) {
//     return res.status(401).json({
//       error: 'Unauthorized: Invalid API key',
//     });
//   }

//   next();
// };

// Routes with appropriate middleware
app.use('/webhook-input', webhookRoute);
app.use('/items', itemsRoute);

// 404 handler
// app.use('*', notFoundHandler);

// Global error handler
app.use(errorHandler);

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
