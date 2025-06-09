import { Request, Response, NextFunction } from 'express';
import { BaseError } from '@/utils/BaseError';
import mongoose from 'mongoose';

/**
 * Interface for error response
 */
interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    statusCode: number;
    timestamp: string;
    context?: Record<string, any>;
    stack?: string;
  };
  requestId?: string;
}

/**
 * Logger utility (you can replace this with your preferred logging library)
 */
const logger = {
  error: (message: string, meta?: any) => {
    console.error(
      `[ERROR] ${message}`,
      meta ? JSON.stringify(meta, null, 2) : ''
    );
  },
  warn: (message: string, meta?: any) => {
    console.warn(
      `[WARN] ${message}`,
      meta ? JSON.stringify(meta, null, 2) : ''
    );
  },
  info: (message: string, meta?: any) => {
    console.info(
      `[INFO] ${message}`,
      meta ? JSON.stringify(meta, null, 2) : ''
    );
  },
};

/**
 * Convert Mongoose validation errors to a more readable format
 */
const handleMongooseValidationError = (
  error: mongoose.Error.ValidationError
): BaseError => {
  const errors = Object.values(error.errors).map((err: any) => ({
    field: err.path,
    message: err.message,
    value: err.value,
  }));

  return new BaseError('Validation failed', 'MONGOOSE_VALIDATION_ERROR', 400, {
    validationErrors: errors,
  });
};

/**
 * Convert Mongoose cast errors to a more readable format
 */
const handleMongooseCastError = (
  error: mongoose.Error.CastError
): BaseError => {
  return new BaseError(
    `Invalid ${error.path}: ${error.value}`,
    'MONGOOSE_CAST_ERROR',
    400,
    {
      field: error.path,
      value: error.value,
      expectedType: error.kind,
    }
  );
};

/**
 * Convert MongoDB duplicate key errors to a more readable format
 */
const handleMongoDuplicateKeyError = (error: any): BaseError => {
  const field = Object.keys(error.keyValue)[0];
  const value = error.keyValue[field];

  return new BaseError(
    `Duplicate value for ${field}: ${value}`,
    'MONGODB_DUPLICATE_KEY_ERROR',
    409,
    {
      field,
      value,
      duplicateKey: error.keyValue,
    }
  );
};

/**
 * Convert various error types to BaseError instances
 */
const normalizeError = (error: any): BaseError => {
  // If it's already a BaseError, return as is
  if (error instanceof BaseError) {
    return error;
  }

  // Handle Mongoose validation errors
  if (error.name === 'ValidationError' && error.errors) {
    return handleMongooseValidationError(error);
  }

  // Handle Mongoose cast errors
  if (error.name === 'CastError') {
    return handleMongooseCastError(error);
  }

  // Handle MongoDB duplicate key errors
  if (error.code === 11000) {
    return handleMongoDuplicateKeyError(error);
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    return new BaseError('Invalid token', 'JWT_INVALID', 401);
  }

  if (error.name === 'TokenExpiredError') {
    return new BaseError('Token expired', 'JWT_EXPIRED', 401);
  }

  // Handle CORS errors
  if (error.message && error.message.includes('CORS')) {
    return new BaseError('CORS policy violation', 'CORS_ERROR', 403);
  }

  // Handle rate limit errors
  if (error.message && error.message.includes('Too many requests')) {
    return new BaseError(error.message, 'RATE_LIMIT_EXCEEDED', 429);
  }

  // Default to generic server error
  return new BaseError(
    error.message || 'Internal server error',
    'INTERNAL_SERVER_ERROR',
    500,
    { originalError: error.name },
    false // Mark as non-operational since it's unexpected
  );
};

/**
 * Main error handling middleware
 */
export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Generate a unique request ID for tracking
  const requestId =
    (req.headers['x-request-id'] as string) ||
    `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Normalize the error
  const normalizedError = normalizeError(error);

  // Log the error with context
  const logContext = {
    requestId,
    method: req.method,
    url: req.originalUrl,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    body: req.method !== 'GET' ? req.body : undefined,
    query: req.query,
    params: req.params,
    error: {
      name: normalizedError.name,
      message: normalizedError.message,
      code: normalizedError.code,
      statusCode: normalizedError.statusCode,
      stack: normalizedError.stack,
      context: normalizedError.context,
    },
  };

  // Log based on error severity
  if (normalizedError.statusCode >= 500) {
    logger.error('Server Error', logContext);
  } else if (normalizedError.statusCode >= 400) {
    logger.warn('Client Error', logContext);
  } else {
    logger.info('Error Handled', logContext);
  }

  // Don't send error details in production for server errors
  const isDevelopment = process.env.NODE_ENV === 'development';
  const shouldExposeDetails = isDevelopment || normalizedError.statusCode < 500;

  // Prepare error response
  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      message: shouldExposeDetails
        ? normalizedError.message
        : 'Internal server error',
      code: normalizedError.code,
      statusCode: normalizedError.statusCode,
      timestamp: normalizedError.timestamp.toISOString(),
      ...(shouldExposeDetails &&
        normalizedError.context && { context: normalizedError.context }),
      ...(isDevelopment && { stack: normalizedError.stack }),
    },
    requestId,
  };

  // Send error response
  res.status(normalizedError.statusCode).json(errorResponse);
};

/**
 * Async error wrapper for route handlers
 * Use this to wrap async route handlers to automatically catch and forward errors
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error = new BaseError(
    `Route ${req.originalUrl} not found`,
    'ROUTE_NOT_FOUND',
    404,
    {
      method: req.method,
      url: req.originalUrl,
    }
  );
  next(error);
};

/**
 * Graceful shutdown handler for uncaught exceptions and unhandled rejections
 */
export const setupGlobalErrorHandlers = (): void => {
  // Handle uncaught exceptions
  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
    });

    // Exit gracefully
    process.exit(1);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    logger.error('Unhandled Rejection', {
      reason: reason?.message || reason,
      stack: reason?.stack,
      promise: promise.toString(),
    });

    // Exit gracefully
    process.exit(1);
  });

  // Handle SIGTERM
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    process.exit(0);
  });

  // Handle SIGINT
  process.on('SIGINT', () => {
    logger.info('SIGINT received, shutting down gracefully');
    process.exit(0);
  });
};
