import { CalculationLog } from '@/database/models/CalculationLog';
import { Item } from '@/database/models/Item';
import { getMultiple } from '@/utils/items';
import { updateOutputColumnValue } from '@/services/webhookService';
import { InternalServerError } from '@/utils/BaseError';
import mongoose from 'mongoose';
import { NextFunction } from 'express';
import logger from '@/logger';

interface UpsertItemParams {
  factor?: number;
  input?: number;
}

interface HistoryParams {
  itemId: string;
  factor: number;
  input: number;
  createdAt: Date;
}

const upsertItem = async (
  itemId: string,
  { factor, input }: UpsertItemParams
) => {
  try {
    const update: any = {};
    if (factor !== undefined) update.factor = factor;
    if (input !== undefined) update.input = input;

    let item = await Item.findOne({ itemId: itemId });

    if (item) {
      const updatedItem = await Item.findOneAndUpdate(
        { itemId: itemId },
        {
          $set: update,
          number: input ?? item.number,
          factor: factor ?? item.factor,
        },
        { new: true }
      );
      return updatedItem;
    } else {
      const newItem = await Item.create({
        itemId,
        factor: factor || 1,
        number: input,
      });
      return newItem;
    }
  } catch (error) {
    logger.error('Failed to process item upsert', {
      itemId,
      operation: 'upsertItem',
      error: error.message,
    });
    throw new InternalServerError('Failed to process item upsert', {
      itemId,
      operation: 'upsertItem',
      error: error.message,
    });
  }
};

const addHistory = async (itemId: string, history: HistoryParams) => {
  try {
    const historyRecord = await CalculationLog.create({
      itemId: itemId,
      factor: history.factor,
      number: history.input,
      createdAt: history.createdAt,
    });

    await Item.findOneAndUpdate(
      { itemId: itemId },
      { $push: { history: historyRecord._id } },
      { new: true }
    );

    return historyRecord;
  } catch (error) {
    logger.error('Failed to add history', {
      itemId,
      operation: 'addHistory',
      error: error.message,
    });
    throw new InternalServerError('Failed to add history', {
      itemId,
      operation: 'addHistory',
      error: error.message,
    });
  }
};

const updateFactor = async ({ factor, boardId, itemId }) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const item = await upsertItem(itemId, {
      factor: factor,
    });

    const result = await getMultiple(item.number, factor);
    await updateOutputColumnValue(boardId, itemId, result);

    const history = await addHistory(itemId, {
      itemId: itemId,
      factor: factor,
      input: item.number,
      createdAt: new Date(),
    });
    await session.commitTransaction();
    return { message: 'Factor updated successfully', history: history };
  } catch (error) {
    await session.abortTransaction();
    logger.error('Failed to update factor', {
      itemId,
      operation: 'updateFactor',
      error: error.message,
    });
  } finally {
    await session.endSession();
  }
};

export { upsertItem, addHistory, updateFactor };
