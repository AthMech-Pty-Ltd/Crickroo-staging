import { useCallback, useSyncExternalStore } from 'react';
import { DeliveryClip } from '../types';
import { AppMode } from '../types/auth';
import {
  subscribeFavorites,
  getFavoritesVersion,
  isClipFavorited,
  isClipFavoriteBusy,
  toggleClipFavorite,
} from '../store/favoritesStore';

export function useSessionFavorites(
  sessionId: string,
  sessionName: string,
  sessionDate: number,
  _sessionMode?: AppMode,
) {
  const favoritesVersion = useSyncExternalStore(
    subscribeFavorites,
    getFavoritesVersion,
    getFavoritesVersion,
  );

  const isFavorite = useCallback(
    (clip: DeliveryClip) => isClipFavorited(sessionId, clip),
    [sessionId],
  );

  const isDownloading = useCallback(
    (clip: DeliveryClip) => isClipFavoriteBusy(sessionId, clip),
    [sessionId],
  );

  const toggleFavorite = useCallback(
    (clip: DeliveryClip) =>
      toggleClipFavorite(clip, sessionId, sessionName, sessionDate),
    [sessionId, sessionName, sessionDate],
  );

  return { isFavorite, isDownloading, toggleFavorite, favoritesVersion };
}
