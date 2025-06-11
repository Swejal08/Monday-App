import express from 'express';
import { DatabaseType, initializeDatabase } from './database/DatabaseFactory';
import mongoose from 'mongoose';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import webhookRoute from '@/routes/webhookRoute';
import itemsRoute from '@/routes/itemRoutes';
import { setupGlobalErrorHandlers } from '@/middleware/errorHandler';

const app = express();
const port = process.env.PORT || 8000;

require('dotenv').config();

setupGlobalErrorHandlers();

app.use(morgan('dev'));

app.use(compression());

app.use(
  cors({
    origin: [`${process.env.APP_URL}`],
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

    server.on('error', (error) => {
      console.error('Server error:', error);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
