import logger from '@/logger';
import { ValidationError } from '@/utils/BaseError';

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
    logger.error('Missing required fields', {
      missingFields,
      providedFields: Object.keys(data),
    });
    throw new ValidationError(
      customMessage || `Missing required fields: ${missingFields.join(', ')}`,
      {
        missingFields,
        providedFields: Object.keys(data),
      }
    );
  }
};
