import { ExternalServiceError, InternalServerError } from '@/utils/BaseError';
import initMondayClient from 'monday-sdk-js';

const updateOutputColumnValue = async (
  boardId: string,
  itemId: string,
  value: number | null
): Promise<{ success: boolean; error?: string }> => {
  const token = process.env.MONDAY_TOKEN;
  if (!token) {
    throw new InternalServerError('Monday token not found', {
      boardId,
      itemId,
      value,
      operation: 'updateOutputColumn',
    });
  }

  const mondayClient = initMondayClient({ token });
  const mondayValue = value === null ? '""' : `"${value}"`;
  try {
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

    await mondayClient.api(query);
    return { success: true };
  } catch (error) {
    throw new ExternalServiceError(
      'Failed to update item board column value',
      'Monday API',
      {
        itemId,
        boardId,
        value,
        operation: 'updateOutputColumn',
        error: error.message,
      }
    );
  }
};

export { updateOutputColumnValue };
