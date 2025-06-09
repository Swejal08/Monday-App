import { ValidationError } from '@/utils/BaseError';

// /**
//  * Utility functions for error handling
//  */

// /**
//  * Validates required fields and throws ValidationError if any are missing
//  */
export const validateRequiredFields = (
  data: Record<string, any>,
  requiredFields: string[],
  customMessage?: string
): void => {
  const missingFields = requiredFields.filter(
    (field) =>
      data[field] === undefined || data[field] === null || data[field] === ''
  );

  if (missingFields.length > 0) {
    throw new ValidationError(
      customMessage || `Missing required fields: ${missingFields.join(', ')}`,
      {
        missingFields,
        providedFields: Object.keys(data),
      }
    );
  }
};

// /**
//  * Validates field types and throws ValidationError if types don't match
//  */
// export const validateFieldTypes = (
//   data: Record<string, any>,
//   fieldTypes: Record<string, string>
// ): void => {
//   const invalidFields: Array<{
//     field: string;
//     expected: string;
//     actual: string;
//   }> = [];

//   Object.entries(fieldTypes).forEach(([field, expectedType]) => {
//     if (data[field] !== undefined) {
//       const actualType = typeof data[field];
//       if (actualType !== expectedType) {
//         invalidFields.push({
//           field,
//           expected: expectedType,
//           actual: actualType,
//         });
//       }
//     }
//   });

//   if (invalidFields.length > 0) {
//     throw new ValidationError('Invalid field types provided', {
//       invalidFields,
//     });
//   }
// };

// /**
//  * Validates email format
//  */
// export const validateEmail = (email: string): boolean => {
//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   return emailRegex.test(email);
// };

// /**
//  * Validates MongoDB ObjectId format
//  */
// export const validateObjectId = (id: string): boolean => {
//   const objectIdRegex = /^[0-9a-fA-F]{24}$/;
//   return objectIdRegex.test(id);
// };

// /**
//  * Throws NotFoundError if resource is not found
//  */
// export const assertResourceExists = <T>(
//   resource: T | null | undefined,
//   resourceName: string,
//   resourceId?: string
// ): asserts resource is T => {
//   if (!resource) {
//     throw new NotFoundError(
//       `${resourceName} not found`,
//       resourceId ? { resourceId, resourceName } : { resourceName }
//     );
//   }
// };

// /**
//  * Wraps database operations with proper error handling
//  */
// export const withDatabaseErrorHandling = async <T>(
//   operation: () => Promise<T>,
//   operationName: string
// ): Promise<T> => {
//   try {
//     return await operation();
//   } catch (error: any) {
//     // If it's already a BaseError, re-throw it
//     if (error instanceof BaseError) {
//       throw error;
//     }

//     // Handle specific database errors
//     if (error.name === 'MongoError' || error.name === 'MongoServerError') {
//       throw new DatabaseError(`Database operation failed: ${operationName}`, {
//         operation: operationName,
//         originalError: error.message,
//         errorCode: error.code,
//       });
//     }

//     // Handle connection errors
//     if (error.name === 'MongoNetworkError') {
//       throw new DatabaseError('Database connection failed', {
//         operation: operationName,
//         originalError: error.message,
//       });
//     }

//     // Generic database error
//     throw new DatabaseError(
//       `Unexpected database error during ${operationName}`,
//       {
//         operation: operationName,
//         originalError: error.message,
//       }
//     );
//   }
// };

// /**
//  * Wraps Monday.com API calls with proper error handling
//  */
// export const withMondayApiErrorHandling = async <T>(
//   operation: () => Promise<T>,
//   operationName: string
// ): Promise<T> => {
//   try {
//     return await operation();
//   } catch (error: any) {
//     // If it's already a BaseError, re-throw it
//     if (error instanceof BaseError) {
//       throw error;
//     }

//     // Handle Monday.com API specific errors
//     if (error.response) {
//       // HTTP error response
//       throw new MondayApiError(
//         `Monday.com API error during ${operationName}: ${error.response.data?.message || error.message}`,
//         {
//           operation: operationName,
//           statusCode: error.response.status,
//           responseData: error.response.data,
//         }
//       );
//     }

//     if (error.request) {
//       // Network error
//       throw new MondayApiError(
//         `Monday.com API network error during ${operationName}`,
//         {
//           operation: operationName,
//           originalError: error.message,
//         }
//       );
//     }

//     // Generic Monday API error
//     throw new MondayApiError(
//       `Unexpected Monday.com API error during ${operationName}`,
//       {
//         operation: operationName,
//         originalError: error.message,
//       }
//     );
//   }
// };

// /**
//  * Retry mechanism with exponential backoff
//  */
// export const withRetry = async <T>(
//   operation: () => Promise<T>,
//   maxRetries: number = 3,
//   baseDelay: number = 1000,
//   operationName?: string
// ): Promise<T> => {
//   let lastError: Error;

//   for (let attempt = 1; attempt <= maxRetries; attempt++) {
//     try {
//       return await operation();
//     } catch (error: any) {
//       lastError = error;

//       // Don't retry for client errors (4xx) or BaseErrors that are operational
//       if (
//         error instanceof BaseError &&
//         error.statusCode < 500 &&
//         error.isOperational
//       ) {
//         throw error;
//       }

//       // If this is the last attempt, throw the error
//       if (attempt === maxRetries) {
//         break;
//       }

//       // Calculate delay with exponential backoff
//       const delay = baseDelay * Math.pow(2, attempt - 1);

//       console.warn(
//         `Attempt ${attempt} failed for ${operationName || 'operation'}, retrying in ${delay}ms...`,
//         { error: error.message }
//       );

//       // Wait before retrying
//       await new Promise((resolve) => setTimeout(resolve, delay));
//     }
//   }

//   // If we get here, all retries failed
//   throw new BaseError(
//     `Operation failed after ${maxRetries} attempts: ${operationName || 'unknown operation'}`,
//     'RETRY_EXHAUSTED',
//     500,
//     {
//       maxRetries,
//       operationName,
//       lastError: lastError.message,
//     }
//   );
// };

// /**
//  * Safely parse JSON with error handling
//  */
// export const safeJsonParse = <T = any>(
//   jsonString: string,
//   defaultValue?: T
// ): T => {
//   try {
//     return JSON.parse(jsonString);
//   } catch (error) {
//     if (defaultValue !== undefined) {
//       return defaultValue;
//     }
//     throw new ValidationError('Invalid JSON format', {
//       jsonString: jsonString.substring(0, 100), // Only show first 100 chars
//       error: (error as Error).message,
//     });
//   }
// };

// /**
//  * Create a timeout promise that rejects after specified time
//  */
// export const withTimeout = <T>(
//   promise: Promise<T>,
//   timeoutMs: number,
//   operationName?: string
// ): Promise<T> => {
//   const timeoutPromise = new Promise<never>((_, reject) => {
//     setTimeout(() => {
//       reject(
//         new BaseError(
//           `Operation timed out after ${timeoutMs}ms: ${operationName || 'unknown operation'}`,
//           'OPERATION_TIMEOUT',
//           408,
//           {
//             timeoutMs,
//             operationName,
//           }
//         )
//       );
//     }, timeoutMs);
//   });

//   return Promise.race([promise, timeoutPromise]);
// };

// /**
//  * Validate pagination parameters
//  */
// export const validatePagination = (
//   page?: string | number,
//   limit?: string | number,
//   maxLimit: number = 100
// ): { page: number; limit: number; skip: number } => {
//   const parsedPage = typeof page === 'string' ? parseInt(page, 10) : page || 1;
//   const parsedLimit =
//     typeof limit === 'string' ? parseInt(limit, 10) : limit || 10;

//   if (isNaN(parsedPage) || parsedPage < 1) {
//     throw new ValidationError('Page must be a positive integer', { page });
//   }

//   if (isNaN(parsedLimit) || parsedLimit < 1) {
//     throw new ValidationError('Limit must be a positive integer', { limit });
//   }

//   if (parsedLimit > maxLimit) {
//     throw new ValidationError(`Limit cannot exceed ${maxLimit}`, {
//       limit: parsedLimit,
//       maxLimit,
//     });
//   }

//   return {
//     page: parsedPage,
//     limit: parsedLimit,
//     skip: (parsedPage - 1) * parsedLimit,
//   };
// };
