import type { AxiosRequestConfig } from 'axios';
import axios from 'axios';

const useAxiosConfig = (config?: AxiosRequestConfig) => {
  const axiosClient = axios.create({
    baseURL: 'https://7d0a-111-119-49-117.ngrok-free.app',
    ...config,
    headers: {
      'Content-type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
      ...config?.headers,
    },
  });

  return axiosClient;
};

export default useAxiosConfig;
