import { CalculationLog } from '@/database/models/CalculationLog';
import { Item } from '@/database/models/Item';
import { addHistory, upsertItem } from '@/services/itemService';
import { updateOutputColumnValue } from '@/services/webhookService';
import { ExternalServiceError } from '@/utils/BaseError';
import { validateRequiredFields } from '@/utils/errors';
import mongoose from 'mongoose';
import logger from '@/logger';

const inputChangeController = async (req, res, next) => {
  const session = await mongoose.startSession();
  const { event } = req.body;
  const { value, pulseId, boardId } = event;

  try {
    session.startTransaction();
    const item = await Item.findOne({ itemId: pulseId });
    const factor = item ? item.factor : 1;
    const result = factor * value.value;
    await updateOutputColumnValue(boardId, pulseId, result);
    const updatedItem = await upsertItem(pulseId, {
      input: value.value,
      factor: factor,
    });
    await addHistory(pulseId, {
      itemId: pulseId,
      factor: factor,
      input: value.value,
      createdAt: new Date(),
    });
    await session.commitTransaction();
    res.json({
      success: true,
      message: 'Output column updated successfully',
      data: updatedItem,
    });
  } catch (error) {
    await session.abortTransaction();
    logger.error('Failed to update output column value', {
      error: error.message,
      itemId: pulseId,
      boardId,
      inputValue: value?.value,
      operation: 'inputChangeController',
    });

    throw new ExternalServiceError(
      'Failed to update item board column value',
      'Monday API',
      {
        pulseId,
        boardId,
        value,
        operation: 'updateOutputColumn',
        error: error.message,
      }
    );
  } finally {
    await session.endSession();
  }
};

export { inputChangeController };
