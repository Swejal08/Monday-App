export class BaseError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly context?: Record<string, any>;
  public readonly timestamp: Date;

  constructor(
    message: string,
    code: string,
    statusCode: number = 500,
    context?: Record<string, any>,
    isOperational: boolean = true
  ) {
    super(message);

    this.name = this.constructor.name;

    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.context = context;
    this.timestamp = new Date();

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      timestamp: this.timestamp.toISOString(),
      ...(this.context && { context: this.context }),
      ...(process.env.NODE_ENV === 'development' && { stack: this.stack }),
    };
  }
}

export class ValidationError extends BaseError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'VALIDATION_ERROR', 400, context);
  }
}

export class NotFoundError extends BaseError {
  constructor(
    message: string = 'Resource not found',
    context?: Record<string, any>
  ) {
    super(message, 'NOT_FOUND_ERROR', 404, context);
  }
}

/**
 * For third-party service failures
 */
export class ExternalServiceError extends BaseError {
  constructor(
    message: string,
    serviceName: string,
    context?: Record<string, any>
  ) {
    super(message, 'EXTERNAL_SERVICE_ERROR', 502, {
      serviceName,
      ...context,
    });
  }
}

export class InternalServerError extends BaseError {
  constructor(
    message: string = 'Internal server error',
    context?: Record<string, any>
  ) {
    super(message, 'INTERNAL_SERVER_ERROR', 500, context);
  }
}
