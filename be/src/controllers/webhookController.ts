import { CalculationLog } from '@/database/models/CalculationLog';
import { Item } from '@/database/models/Item';
import { addHistory, upsertItem } from '@/services/itemService';
import { updateOutputColumnValue } from '@/services/webhookService';
import { validateRequiredFields } from '@/utils/errors';
import mongoose from 'mongoose';

const inputChangeController = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { event } = req.body;
    const { value, pulseId, boardId } = event;

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
  } finally {
    await session.endSession();
  }
};

export { inputChangeController };
