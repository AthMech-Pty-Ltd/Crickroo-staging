import { Platform } from 'react-native';
import { getFCMToken } from './notifications.service';
import apiClient from './api/apiClient';
import { API_CONFIG } from '../config/api.config';

/**
 * Fire-and-forget: gets FCM token and posts it to the backend.
 * Safe to call after login, register, and token refresh.
 */
export async function syncDeviceToken(): Promise<void> {
  const token = await getFCMToken();
  if (!token) return;
  await apiClient.post(API_CONFIG.ENDPOINTS.DEVICE_TOKEN, {
    token,
    platform: Platform.OS,
  });
}
