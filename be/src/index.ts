import express from 'express';
import initMondayClient from 'monday-sdk-js';
import { DatabaseType, initializeDatabase } from './database/DatabaseFactory';
import { Item } from './database/models/Item';
import { CalculationLog } from './database/models/CalculationLog';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express();
const port = 8000;

// Add CORS headers for webhook requests
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'ngrok-skip-browser-warning',
    ],
    credentials: false,
  })
);

require('dotenv').config();

// Add middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Handle preflight requests explicitly

app.post('/', (req, res) => {
  console.log('POST / received:', req.body);
  res.status(200).send(req.body);
});

const updateOutputColumnValue = async (
  boardId: string,
  itemId: string,
  value: number | null,
  attempt = 1
): Promise<{ success: boolean; error?: string }> => {
  const token =
    'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjUyMzQxNDI1MCwiYWFpIjoxMSwidWlkIjo3NDk5NjE0MywiaWFkIjoiMjAyNS0wNi0wOFQwNjoyNzo0My44NDJaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6MjkxMTg0ODgsInJnbiI6ImFwc2UyIn0.yRxQm2FzE5rvglB-ag_vNeyyhnLyf1HzkMcgrj5DyUM';
  if (!token) {
    // throw new BaseError('Monday token not found', 'MONDAY_TOKEN_MISSING', 500);
  }

  const mondayClient = initMondayClient({ token });
  const mondayValue = value === null ? '""' : `"${value}"`;
  console.log(mondayValue, 'mondayValue');
  try {
    console.log(`Attempt ${attempt} to update column value for item ${itemId}`);

    const query = `
      mutation {
        change_simple_column_value(
          item_id: ${itemId},
          column_id: "numeric_mkq326mh",
          board_id: ${boardId},
          value: ${mondayValue}
        ) {
          id
        }
      }
    `;

    const response = await mondayClient.api(query);
    console.log(response);
    if (response.errors) {
      // throw new BaseError(
      //   `Monday API error: ${response.errors[0].message}`,
      //   'MONDAY_API_ERROR',
      //   400,
      //   response.errors
      // );
    }

    // logger.info('Column update successful:', response);
    return { success: true };
  } catch (error) {
    console.log(`Attempt ${attempt} failed:`, error);
    // logger.error(`Attempt ${attempt} failed:`, error);

    // if (attempt < MAX_RETRIES) {
    //   logger.info(`Retrying in ${RETRY_DELAY_MS}ms...`);
    //   await sleep(RETRY_DELAY_MS);
    //   return updateOutputColumnValue(boardId, itemId, value, attempt + 1);
    // }

    // const errorMessage = `Failed to update column after ${MAX_RETRIES} attempts`;
    // logger.error(errorMessage);
    // return {
    //   success: false,
    //   error: error instanceof BaseError ? error.message : errorMessage,
    // };
  }
};

const upsertItem = async (
  itemId: string,
  { factor, input }: { factor?: number; input?: number }
) => {
  const update: any = {};
  if (factor !== undefined) update.factor = factor;
  if (input !== undefined) update.input = input;
  try {
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
    console.log(error);
    throw new Error('Failed to add item');
  }
};

const addHistory = async (itemId: string, history) => {
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
    throw new Error('Failed to add history');
  }
};

const getMultiple = (value: number, factor: number) => {
  try {
    return Math.round(value * factor * 100) / 100;
  } catch (error) {
    console.log(error);
  }
};

const updateFactor = async ({ factor, boardId, itemId }) => {
  try {
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
    return { message: 'Factor updated successfully', history: history };
  } catch (error) {
    console.log(error);
  }
};

app.post('/webhook-input', async (req, res) => {
  console.log(req.body);
  res.send(req.body);

  try {
    // TODO: Handle case where input column is removed or null
    const { event } = req.body;
    const { value, pulseId, boardId } = event;

    const item = await Item.findOne({ itemId: pulseId });
    console.log(item, 'item');
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
    res.json({
      success: true,
      message: 'Output column updated successfully',
      data: updatedItem,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to process input change',
      error: error.message,
    });
  }
});

app.get('/items/:itemId/logs', async (req, res) => {
  const itemId = req.params.itemId;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  try {
    const [calculationLogs, total] = await Promise.all([
      CalculationLog.find({ itemId: itemId })
        .sort({ createdAt: -1 })
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
    console.log(error);
    res.status(500).json({ error: 'Failed to fetch calculation logs' });
  }
});

app.get('/items/:itemId', async (req, res) => {
  const itemId = req.params.itemId;
  const item = await Item.findOne({ itemId: itemId });
  console.log(item, 'item');
  res.status(200).json(item);
});

app.put('/items/:itemId/factor', async (req, res) => {
  try {
    const { factor, boardId } = req.body;
    const itemId = req.params.itemId;

    // if (!factor || !boardId || !itemId) {
    //   logger.warn('Missing required parameters:', {
    //     factor,
    //     boardId,
    //     itemId,
    //   });
    //   return res.status(400).json({ error: 'Missing required parameters' });
    // }

    const outputData = await updateFactor({ factor, boardId, itemId });
    res.status(200).json(outputData);
  } catch (error) {
    console.log(error);
    // logger.error('Error in updateFactorController:', error);

    // if (error instanceof BaseError) {
    //   logger.error('BaseError details:', {
    //     message: error.message,
    //     code: error.code,
    //     statusCode: error.statusCode,
    //   });
    //   res.status(error.statusCode).json({ error: error.message });
    // } else {
    //   logger.error('Unexpected error:', error);
    //   res.status(500).json({ error: 'Internal server error' });
    // }
  }
});

const startServer = async () => {
  try {
    await initializeDatabase(DatabaseType.MONGODB);
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.log('Failed to start server:', error);
  }
};

startServer();
