import { CalculationLog } from '@/database/models/CalculationLog';
import { Item } from '@/database/models/Item';
import logger from '@/logger';
import { updateFactor } from '@/services/itemService';
import { InternalServerError, NotFoundError } from '@/utils/BaseError';
import { validateRequiredFields } from '@/utils/errors';

const updateFactorController = async (req, res, next) => {
  const { factor, boardId } = req.body;
  const itemId = req.params.itemId;

  validateRequiredFields({ factor, boardId, itemId }, [
    'factor',
    'boardId',
    'itemId',
  ]);

  const outputData = await updateFactor({ factor, boardId, itemId });
  res.status(200).json(outputData);
};

const getItemController = async (req, res, next) => {
  const itemId = req.params.itemId;
  try {
    const item = await Item.findOne({ itemId: itemId });
    if (!item) {
      logger.error('Item not found', {
        itemId,
        operation: 'getItem',
      });
      throw new NotFoundError('Item not found', {
        itemId,
        operation: 'getItem',
      });
    }

    res.status(200).json(item);
  } catch (err) {
    if (err instanceof NotFoundError) {
      return next(err);
    }

    logger.error('Failed to fetch item', {
      itemId,
      operation: 'getItem',
      error: err.message,
    });
    throw new InternalServerError('Failed to fetch item', {
      itemId,
      operation: 'getItem',
      error: err.message,
    });
  }
};

const getCalculationLogsController = async (req, res, next) => {
  const itemId = req.params.itemId;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  try {
    const [calculationLogs, total] = await Promise.all([
      CalculationLog.find({ itemId: itemId })
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit),
      CalculationLog.countDocuments({ itemId: itemId }),
    ]);

    res.status(200).json({
      data: calculationLogs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Failed to fetch calculation logs', {
      itemId,
      operation: 'getCalculationLogs',
      error: error.message,
    });
    throw new InternalServerError('Failed to fetch calculation logs', {
      itemId,
      operation: 'getCalculationLogs',
      error: error.message,
    });
  }
};

export {
  updateFactorController,
  getItemController,
  getCalculationLogsController,
};
