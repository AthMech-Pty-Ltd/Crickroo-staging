import { useEffect } from 'react';
import {
  requestNotificationPermission,
  onTokenRefresh,
  onForegroundMessage,
  isHighlightReady,
} from '../services/notifications.service';
import { syncDeviceToken } from '../services/deviceToken.service';
import { downloadAndSaveHighlight } from '../services/highlightDownload.service';

export function useNotifications() {
  useEffect(() => {
    let unsubscribeRefresh: (() => void) | undefined;
    let unsubscribeForeground: (() => void) | undefined;

    async function init() {
      const granted = await requestNotificationPermission();
      if (!granted) {
        console.warn('Push notification permission not granted');
        return;
      }

      syncDeviceToken().catch(err =>
        console.warn('Device token sync failed:', err),
      );

      unsubscribeRefresh = onTokenRefresh(() => {
        syncDeviceToken().catch(err =>
          console.warn('Device token refresh sync failed:', err),
        );
      });

      unsubscribeForeground = onForegroundMessage(msg => {
        if (!isHighlightReady(msg)) return;
        downloadAndSaveHighlight(
          String(msg.data?.download_url),
          String(msg.data?.s3_key),
        ).catch(err =>
          console.warn('Foreground highlight download failed:', err),
        );
      });
    }

    init();

    return () => {
      unsubscribeRefresh?.();
      unsubscribeForeground?.();
    };
  }, []);
}
