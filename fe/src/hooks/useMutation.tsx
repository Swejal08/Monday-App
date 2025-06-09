import { useState } from 'react';
import useAxiosConfig from './useAxiosConfig';
import { AxiosError, type AxiosRequestConfig, type AxiosResponse } from 'axios';

type IAxiosResponseType = AxiosResponse | AxiosError;

interface IMutationOptions {
  options?: AxiosRequestConfig;
  onSuccess?: (data?: AxiosResponse) => void | Promise<void>;
  onError?: (error?: AxiosError) => void | Promise<void>;
  onSettled?: (data?: IAxiosResponseType) => void | Promise<void>;
  successMessage?: string;
}

const useMutation = () => {
  const axiosInstance = useAxiosConfig();
  const [isMutating, setIsMutating] = useState(false);
  const [isError, setIsError] = useState(false);
  const [responseData, setResponseData] = useState<IAxiosResponseType>();

  const mutate = async ({
    options,
    onSuccess,
    onError,
    onSettled,
  }: IMutationOptions): Promise<AxiosResponse | undefined> => {
    setIsMutating(true);

    try {
      const response = (await axiosInstance(
        options as AxiosRequestConfig
      )) as AxiosResponse;
      setIsError(false);
      setResponseData(response);
      await onSuccess?.(response);
      return response;
    } catch (error) {
      const errorResponse = error as AxiosError<{
        message: string;
        error: string;
      }>;
      setIsError(true);
      setResponseData(errorResponse.response);
      await onError?.(errorResponse);
      return errorResponse.response;
    } finally {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await onSettled?.(responseData!);
      setIsMutating(false);
    }
  };

  const postRequest = (url: string, args: IMutationOptions) => {
    mutate({
      ...args,
      options: {
        url,
        method: 'POST',
        ...args.options,
      },
    });
  };

  const putRequest = (url: string, args: IMutationOptions) => {
    mutate({
      ...args,
      options: {
        url,
        method: 'PUT',
        ...args.options,
      },
    });
  };

  return {
    postRequest,
    putRequest,
    isMutating,
    isError,
    responseData,
  };
};

export default useMutation;
