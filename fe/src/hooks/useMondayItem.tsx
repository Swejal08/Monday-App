import { useEffect, useState } from 'react';
import mondaySdk from 'monday-sdk-js';
import type { MondayContext } from '@/types';
const monday = mondaySdk();

const useMondayItem = () => {
  const [item, setItem] = useState<MondayContext['data'] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getItem = async () => {
      try {
        const context = (await monday.get('context')) as MondayContext;
        const itemId = context.data.itemId;
        const itemName = context.data.itemName;
        const boardId = context.data.boardId;

        setItem({
          itemId: itemId,
          itemName: itemName,
          boardId: boardId,
        });
      } catch (error) {
        setError(
          error instanceof Error ? error.message : 'Unknown error occurred'
        );
      }
    };

    getItem();
  }, []);
  return { item, error };
};

export default useMondayItem;
