import type { AxiosRequestConfig } from 'axios';
import axios from 'axios';

const useAxiosConfig = (config?: AxiosRequestConfig) => {
  const axiosClient = axios.create({
    baseURL: process.env.API_BASE_URL,
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
