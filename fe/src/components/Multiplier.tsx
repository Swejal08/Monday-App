import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2Icon } from 'lucide-react';
import { debounce } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import type { CalculationLogResponse, FactorFormData } from '@/types';
import { useEffect, useState, useRef } from 'react';
import mondaySdk from 'monday-sdk-js';

import useMondayItem from '@/hooks/useMondayItem';
import useMutation from '@/hooks/useMutation';
import useFetcher from '@/hooks/useFetcher';
import { PAGE_SIZE } from '@/constant';
import PaginationBar from '@/components/Pagination';
import CalculationTable from '@/components/CalculationTable';
import Accordion from '@/components/Accordion';
import TableLoading from '@/components/TableLoading';
import useNotification from '@/hooks/useNotification';

const monday = mondaySdk();
const Multiplier = () => {
  const { item, error: itemError } = useMondayItem();
  const { fetcher } = useFetcher();
  const { putRequest: updateFactor, isMutating } = useMutation();
  const { successNotification, errorNotification } = useNotification();
  const [isFetching, setIsFetching] = useState(false);
  const [history, setHistory] = useState<CalculationLogResponse['data']>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { register, handleSubmit, setValue } = useForm<FactorFormData>({
    defaultValues: {
      factor: 1,
    },
  });

  useEffect(() => {
    if (!item?.itemId) return;
    fetchFactor();
  }, [item?.itemId]);

  useEffect(() => {
    fetchCalculationHistory();

    // Start polling every 3 seconds
    if (item?.itemId) {
      pollingIntervalRef.current = setInterval(() => {
        fetchCalculationHistorySilently();
      }, 3000);
    }

    // Cleanup interval on unmount or when dependencies change
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [page, item?.itemId]);

  const fetchCalculationHistory = async () => {
    if (!item?.itemId) return;
    try {
      setIsFetching(true);
      const response = await fetcher(
        `/items/${item.itemId}/logs?page=${page}&limit=${PAGE_SIZE}`
      );
      setHistory(response.data);
      setPage(response.pagination.page);
      setTotalPages(response.pagination.totalPages);
    } catch (err) {
      console.log(err);
    } finally {
      setIsFetching(false);
    }
  };

  const fetchCalculationHistorySilently = async () => {
    if (!item?.itemId) return;
    try {
      const response = await fetcher(
        `/items/${item.itemId}/logs?page=${page}&limit=${PAGE_SIZE}`
      );
      setHistory(response.data);
      setPage(response.pagination.page);
      setTotalPages(response.pagination.totalPages);
    } catch (err) {
      console.log(err);
    }
  };

  if (itemError) {
    errorNotification('Error fetching item board');
    return <h1>Error fetching item</h1>;
  }

  const fetchFactor = async () => {
    if (!item?.itemId) return;
    try {
      const response = await fetcher(`/items/${item.itemId}`);
      setValue('factor', response.factor.toString());
    } catch (err) {
      console.error(err);
      errorNotification('Failed to fetch factor. Please try again.');
    }
  };

  const debouncedCalculateFactor = debounce(
    (factor: number, itemId?: string, boardId?: string) => {
      if (factor > 0 && itemId && boardId) {
        calculateFactor(factor, itemId, boardId);
      }
    },
    500
  );
  const handleFactorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!item) return;
    const value = parseFloat(e.target.value);
    debouncedCalculateFactor(value, item.itemId, item.boardId);
  };

  const calculateFactor = async (
    factor: number,
    itemId: string,
    boardId: string
  ) => {
    await updateFactor(`/items/${itemId}/factor`, {
      options: {
        data: {
          factor,
          boardId: boardId,
        },
      },
      onSuccess: () => {
        successNotification('Calculation done successfully');
        fetchCalculationHistory();
      },
      onError: () => {
        errorNotification(
          'An unexpected error occurred while performing the calculation.'
        );
      },
    });
  };

  const onCalculate = async (data: FactorFormData) => {
    if (!item) return;
    await calculateFactor(data.factor, item.itemId, item.boardId);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center pt-16">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        Calculate Factor
      </h1>
      <form
        onSubmit={handleSubmit(onCalculate)}
        className="flex items-center space-x-4 mb-12"
      >
        <div className="flex w-full max-w-sm items-center gap-2">
          <Input
            type="number"
            placeholder="Enter factor"
            {...register('factor', {
              required: true,
              valueAsNumber: true,
            })}
            onChange={handleFactorChange}
          />
          <Button
            size="sm"
            variant="outline"
            disabled={isMutating || history.length === 0}
            type="submit"
          >
            {isMutating && <Loader2Icon className="animate-spin" />}
            Calculate
          </Button>
        </div>
      </form>
      <Accordion
        title="Calculation History"
        value="history"
        isFetching={isFetching}
        loadingComponent={<TableLoading loadingRows={3} loadingColumns={3} />}
        isEmpty={history.length === 0 && !isFetching}
        emptyComponent={
          <div className="text-center pr-5 text-gray-500">
            No calculation history
          </div>
        }
      >
        <>
          <CalculationTable history={history} />
          <PaginationBar
            page={page}
            totalPages={totalPages}
            setPage={setPage}
          />
        </>
      </Accordion>
    </div>
  );
};

export default Multiplier;
