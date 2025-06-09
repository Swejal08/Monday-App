// /**
//  * Examples of how to use the BaseError handling system
//  * This file demonstrates various patterns and best practices
//  */

// import { Request, Response, NextFunction } from 'express';
// import {
//   BaseError,
//   ValidationError,
//   NotFoundError,
//   DatabaseError,
//   MondayApiError,
//   AuthenticationError,
//   ConflictError,
// } from '@/utils/BaseError';
// import {
//   validateRequiredFields,
//   validateFieldTypes,
//   assertResourceExists,
//   withDatabaseErrorHandling,
//   withMondayApiErrorHandling,
//   withRetry,
//   validatePagination,
//   safeJsonParse,
//   withTimeout,
// } from '@/utils/errorUtils';
// import { asyncHandler } from '@/middleware/errorHandler';

// // Example 1: Basic validation with custom error
// export const exampleValidation = asyncHandler(
//   async (req: Request, res: Response) => {
//     const { email, name, age } = req.body;

//     // Validate required fields
//     validateRequiredFields({ email, name, age }, ['email', 'name', 'age']);

//     // Validate field types
//     validateFieldTypes({ name, age }, { name: 'string', age: 'number' });

//     // Custom validation with specific error
//     if (age < 18) {
//       throw new ValidationError('User must be at least 18 years old', {
//         providedAge: age,
//         minimumAge: 18,
//       });
//     }

//     res.json({ success: true, message: 'Validation passed' });
//   }
// );

// // Example 2: Database operations with error handling
// export const exampleDatabaseOperation = asyncHandler(
//   async (req: Request, res: Response) => {
//     const { userId } = req.params;

//     const user = await withDatabaseErrorHandling(async () => {
//       // Simulate database operation
//       const result = await someUserModel.findById(userId);
//       return result;
//     }, 'find user by ID');

//     // Assert resource exists
//     assertResourceExists(user, 'User', userId);

//     res.json({ success: true, data: user });
//   }
// );

// // Example 3: Monday.com API integration with error handling
// export const exampleMondayApiCall = asyncHandler(
//   async (req: Request, res: Response) => {
//     const { boardId, itemId, value } = req.body;

//     validateRequiredFields({ boardId, itemId, value }, [
//       'boardId',
//       'itemId',
//       'value',
//     ]);

//     const result = await withMondayApiErrorHandling(async () => {
//       // Simulate Monday.com API call
//       return await mondayClient.api(`
//         mutation {
//           change_simple_column_value(
//             item_id: ${itemId},
//             board_id: ${boardId},
//             value: "${value}"
//           ) {
//             id
//           }
//         }
//       `);
//     }, 'update Monday.com item');

//     res.json({ success: true, data: result });
//   }
// );

// // Example 4: Retry mechanism with timeout
// export const exampleRetryWithTimeout = asyncHandler(
//   async (req: Request, res: Response) => {
//     const { url } = req.body;

//     validateRequiredFields({ url }, ['url']);

//     const result = await withTimeout(
//       withRetry(
//         async () => {
//           // Simulate external API call that might fail
//           const response = await fetch(url);
//           if (!response.ok) {
//             throw new Error(`HTTP ${response.status}: ${response.statusText}`);
//           }
//           return response.json();
//         },
//         3, // max retries
//         1000, // base delay
//         'external API call'
//       ),
//       10000, // 10 second timeout
//       'external API call with retry'
//     );

//     res.json({ success: true, data: result });
//   }
// );

// // Example 5: Pagination validation
// export const examplePagination = asyncHandler(
//   async (req: Request, res: Response) => {
//     const { page, limit, skip } = validatePagination(
//       req.query.page as string,
//       req.query.limit as string,
//       50 // max limit
//     );

//     // Use pagination parameters in your query
//     const results = await withDatabaseErrorHandling(
//       () => someModel.find().skip(skip).limit(limit),
//       'paginated query'
//     );

//     res.json({
//       success: true,
//       data: results,
//       pagination: { page, limit, skip },
//     });
//   }
// );

// // Example 6: Safe JSON parsing
// export const exampleJsonParsing = asyncHandler(
//   async (req: Request, res: Response) => {
//     const { jsonString } = req.body;

//     validateRequiredFields({ jsonString }, ['jsonString']);

//     // Safe parsing with default value
//     const parsedData = safeJsonParse(jsonString, { default: 'value' });

//     res.json({ success: true, data: parsedData });
//   }
// );

// // Example 7: Custom error with context
// export const exampleCustomError = asyncHandler(
//   async (req: Request, res: Response) => {
//     const { action } = req.body;

//     if (action === 'forbidden') {
//       throw new BaseError(
//         'This action is not allowed',
//         'CUSTOM_FORBIDDEN_ACTION',
//         403,
//         {
//           action,
//           timestamp: new Date().toISOString(),
//           userId: req.user?.id, // assuming you have user context
//         }
//       );
//     }

//     res.json({ success: true, message: 'Action completed' });
//   }
// );

// // Example 8: Authentication error
// export const exampleAuthError = asyncHandler(
//   async (req: Request, res: Response) => {
//     const token = req.headers.authorization?.replace('Bearer ', '');

//     if (!token) {
//       throw new AuthenticationError('No token provided');
//     }

//     // Simulate token validation
//     if (token !== 'valid-token') {
//       throw new AuthenticationError('Invalid token', { token });
//     }

//     res.json({ success: true, message: 'Authenticated' });
//   }
// );

// // Example 9: Conflict error (duplicate resource)
// export const exampleConflictError = asyncHandler(
//   async (req: Request, res: Response) => {
//     const { email } = req.body;

//     validateRequiredFields({ email }, ['email']);

//     // Simulate checking for existing user
//     const existingUser = await withDatabaseErrorHandling(
//       () => userModel.findOne({ email }),
//       'check existing user'
//     );

//     if (existingUser) {
//       throw new ConflictError('User with this email already exists', { email });
//     }

//     // Create new user...
//     res.json({ success: true, message: 'User created' });
//   }
// );

// // Example 10: Complex operation with multiple error types
// export const exampleComplexOperation = asyncHandler(
//   async (req: Request, res: Response) => {
//     const { userId, data, externalApiUrl } = req.body;

//     // Step 1: Validation
//     validateRequiredFields({ userId, data, externalApiUrl }, [
//       'userId',
//       'data',
//       'externalApiUrl',
//     ]);
//     validateFieldTypes({ userId }, { userId: 'string' });

//     // Step 2: Database operation
//     const user = await withDatabaseErrorHandling(
//       () => userModel.findById(userId),
//       'find user'
//     );
//     assertResourceExists(user, 'User', userId);

//     // Step 3: External API call with retry and timeout
//     const externalResult = await withTimeout(
//       withRetry(
//         () =>
//           withMondayApiErrorHandling(
//             () => fetch(externalApiUrl).then((r) => r.json()),
//             'external API call'
//           ),
//         3,
//         1000,
//         'external API with retry'
//       ),
//       15000,
//       'external API with timeout'
//     );

//     // Step 4: Update database
//     const updatedUser = await withDatabaseErrorHandling(
//       () =>
//         userModel.findByIdAndUpdate(
//           userId,
//           {
//             ...data,
//             externalData: externalResult,
//           },
//           { new: true }
//         ),
//       'update user'
//     );

//     res.json({
//       success: true,
//       data: updatedUser,
//       message: 'Complex operation completed successfully',
//     });
//   }
// );

// // Mock models and clients for examples (replace with your actual implementations)
// const someUserModel = {
//   findById: async (id: string) => ({ id, name: 'John Doe' }),
// };

// const someModel = {
//   find: () => ({
//     skip: (n: number) => ({
//       limit: (n: number) => Promise.resolve([{ id: 1 }, { id: 2 }]),
//     }),
//   }),
// };

// const userModel = {
//   findOne: async (query: any) => null,
//   findById: async (id: string) => ({ id, name: 'John Doe' }),
//   findByIdAndUpdate: async (id: string, update: any, options: any) => ({
//     id,
//     ...update,
//   }),
// };

// const mondayClient = {
//   api: async (query: string) => ({ data: { success: true } }),
// };
