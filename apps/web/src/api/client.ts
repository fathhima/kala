import { Configuration } from '@/api';
import './interceptors';

const API_URL = import.meta.env.VITE_API_URL;

export const apiConfig = new Configuration({
  basePath: API_URL,
  baseOptions: {
    withCredentials: true,
  },
});
