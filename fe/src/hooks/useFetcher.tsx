import type { AxiosRequestHeaders } from 'axios';
import useAxiosConfig from './useAxiosConfig';

interface IAxiosParams {
  params?: Record<string, any>;
  headers?: AxiosRequestHeaders;
}

//A reusable hook to make GET requests.
const useFetcher = <T = any,>(options?: IAxiosParams) => {
  const axiosInstance = useAxiosConfig();

  const fetcher = async (
    endpoint: string,
    requestOptions?: IAxiosParams
  ): Promise<T> => {
    const response = await axiosInstance.get<T>(endpoint, {
      headers: { ...options?.headers, ...requestOptions?.headers },
      params: { ...options?.params, ...requestOptions?.params },
    });
    return response.data;
  };

  return { fetcher };
};

export default useFetcher;
