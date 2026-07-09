import messaging, {
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import notifee, { AuthorizationStatus } from '@notifee/react-native';
import { Platform } from 'react-native';
import apiClient from './api/apiClient';
import { API_CONFIG } from '../config/api.config';

export interface AppNotification {
  id: string;
  type: 'session_highlights_ready' | 'highlight_ready';
  title: string | null;
  body: string | null;
  push_sent: boolean;
  created_at: string;
  session_id: string | null;
  session_number: number | null;
  total_balls: number | null;
  generation_number: number | null;
  s3_key: string | null;
  download_url: string | null;
}

export interface GetNotificationsResponse {
  notifications: AppNotification[];
  total: number;
  page: number;
  limit: number;
}

export type PushMessage = FirebaseMessagingTypes.RemoteMessage;

export type HighlightReadyPayload = {
  type: 'highlight_ready';
  download_url: string;
  s3_key: string;
};

export function isHighlightReady(
  msg: PushMessage,
): msg is PushMessage & { data: HighlightReadyPayload } {
  return msg.data?.type === 'highlight_ready';
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'ios') {
    const status = await messaging().requestPermission();
    const granted =
      status === messaging.AuthorizationStatus.AUTHORIZED ||
      status === messaging.AuthorizationStatus.PROVISIONAL;
    return granted;
  }
  // Android 13+ requires POST_NOTIFICATIONS at runtime; notifee no-ops on older versions.
  const settings = await notifee.requestPermission();
  return (
    settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
    settings.authorizationStatus === AuthorizationStatus.PROVISIONAL
  );
}

export async function getFCMToken(): Promise<string | null> {
  try {
    if (!messaging().isDeviceRegisteredForRemoteMessages) {
      await messaging().registerDeviceForRemoteMessages();
    }
    const token = await messaging().getToken();
    return token;
  } catch (err) {
    console.warn('Failed to get FCM token:', err);
    return null;
  }
}

export function onTokenRefresh(handler: (token: string) => void): () => void {
  return messaging().onTokenRefresh(handler);
}

export function onForegroundMessage(
  handler: (msg: PushMessage) => void,
): () => void {
  return messaging().onMessage(handler);
}

export async function getNotifications(
  page = 1,
  limit = 20,
  type?: 'session_highlights_ready' | 'highlight_ready',
): Promise<GetNotificationsResponse> {
  const params: Record<string, any> = { page, limit };
  if (type) params.type = type;
  const response = await apiClient.get<GetNotificationsResponse>(
    API_CONFIG.ENDPOINTS.NOTIFICATIONS,
    { params },
  );
  return response.data;
}
