import axios from 'axios';
import { API_CONFIG } from '../../config/api.config';
import { storage } from '../../utils/storage';
import { getIsConnected, isNetworkError } from '../../utils/network';

const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  async config => {
    const isOnline = await getIsConnected();
    if (!isOnline) {
      const offlineError = new Error('Network Error');
      (offlineError as any).isAxiosError = true;
      (offlineError as any).code = 'ERR_NETWORK';
      return Promise.reject(offlineError);
    }

    const token = await storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error),
);

apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    const isRefreshCall = originalRequest?.url?.includes(
      API_CONFIG.ENDPOINTS.AUTH.REFRESH,
    );
    if (error.response?.status === 401 && isRefreshCall) {
      await storage.clearAll();
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await storage.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const { authService } = require('../auth.service');
        const responseData = await authService.refresh({
          refresh_token: refreshToken,
        });

        if (responseData.access_token) {
          originalRequest.headers.Authorization = `Bearer ${responseData.access_token}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        if (!isNetworkError(refreshError)) {
          await storage.clearAll();
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
