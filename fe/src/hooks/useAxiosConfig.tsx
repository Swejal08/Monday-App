import type { AxiosRequestConfig } from 'axios';
import axios from 'axios';

const useAxiosConfig = (config?: AxiosRequestConfig) => {
  const axiosClient = axios.create({
    baseURL:
      'https://4a8b-2400-1a00-3b40-dca8-3daf-f153-b0c5-1ee2.ngrok-free.app',
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
