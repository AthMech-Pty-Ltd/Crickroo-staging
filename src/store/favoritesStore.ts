import { FavoriteClip } from '../types/favorites';
import { DeliveryClip } from '../types';
import { sessionService } from '../services/session.service';
import { AppMode } from '../types/auth';

// Unique key per clip across sessions
export function clipKey(sessionId: string, ballNumber: number) {
  return `${sessionId}_${ballNumber}`;
}

function extractKeyFromUrl(url: string | undefined | null): string {
  if (!url) return '';
  try {
    // Remove query params
    const withoutQuery = url.split('?')[0];

    // Find double slashes (e.g., after https:) and skip to pathname
    const doubleSlashIndex = withoutQuery.indexOf('//');
    let path = '';
    if (doubleSlashIndex !== -1) {
      const rest = withoutQuery.substring(doubleSlashIndex + 2);
      const firstSlashIndex = rest.indexOf('/');
      path = firstSlashIndex !== -1 ? rest.substring(firstSlashIndex + 1) : '';
    } else {
      path = withoutQuery.startsWith('/')
        ? withoutQuery.substring(1)
        : withoutQuery;
    }

    path = decodeURIComponent(path);
    return path;
  } catch {
    const withoutQuery = url.split('?')[0];
    return withoutQuery.startsWith('/')
      ? withoutQuery.substring(1)
      : withoutQuery;
  }
}

export async function loadFavoritesPaginated(
  page: number = 1,
  limit: number = 30,
  sessionMode?: AppMode,
): Promise<{ items: FavoriteClip[]; totalPages: number; currentPage: number }> {
  try {
    const res = await sessionService.getFavourites(page, limit, sessionMode);
    const mapped = (res.items || []).map(item => {
      const createdTime = Date.parse(item.created_at) || Date.now();
      const videoKey = extractKeyFromUrl(item.video_url);
      return {
        favouriteId: item.id,
        sessionId: item.session_id,
        sessionName: `Session #${item.session_number}`,
        sessionDate: createdTime,
        ballNumber: item.ball_number,
        localVideoPath: item.video_url || '',
        localThumbnailPath: item.thumbnail_url || '',
        isHighlight: false,
        result: `Ball ${item.ball_number}`,
        detail: '',
        clipData: null,
        savedAt: createdTime,
        videoKey: videoKey,
        configVideoKey: videoKey,
        thumbnailKey: extractKeyFromUrl(item.thumbnail_url),
        dataKey: extractKeyFromUrl(item.data_url),
      } satisfies FavoriteClip;
    });
    return {
      items: mapped,
      totalPages: res.total_pages,
      currentPage: res.page,
    };
  } catch (error) {
    console.error('Error loading favourites page from API:', error);
    return {
      items: [],
      totalPages: 0,
      currentPage: page,
    };
  }
}

type FavEntry = { favourited: boolean; favouriteId?: string };

const favStatus = new Map<string, FavEntry>();
const favInFlight = new Set<string>();
const favListeners = new Set<() => void>();
let favVersion = 0;

function emitFav() {
  favVersion += 1;
  favListeners.forEach(l => l());
}

export function subscribeFavorites(listener: () => void): () => void {
  favListeners.add(listener);
  return () => {
    favListeners.delete(listener);
  };
}

export function getFavoritesVersion(): number {
  return favVersion;
}

export function isClipFavorited(
  sessionId: string,
  clip: DeliveryClip,
): boolean {
  const entry = favStatus.get(clipKey(sessionId, clip.ballNumber));
  return entry ? entry.favourited : !!clip.isFavorite;
}
export function isClipFavoriteBusy(
  sessionId: string,
  clip: DeliveryClip,
): boolean {
  return favInFlight.has(clipKey(sessionId, clip.ballNumber));
}

function currentEntry(key: string, clip: DeliveryClip): FavEntry {
  return (
    favStatus.get(key) ?? {
      favourited: !!clip.isFavorite,
      favouriteId: clip.favouriteId,
    }
  );
}

export async function toggleClipFavorite(
  clip: DeliveryClip,
  sessionId: string,
  sessionName: string,
  sessionDate: number,
): Promise<void> {
  const key = clipKey(sessionId, clip.ballNumber);
  if (favInFlight.has(key)) return;

  const prev = currentEntry(key, clip);
  favInFlight.add(key);

  if (prev.favourited && !prev.favouriteId) {
    favInFlight.delete(key);
    console.warn('[Favorites] Cannot remove — missing favouriteId for', key);
    return;
  }

  favStatus.set(
    key,
    prev.favourited
      ? { favourited: false, favouriteId: undefined }
      : { favourited: true, favouriteId: prev.favouriteId },
  );
  emitFav();

  try {
    if (prev.favourited) {
      await removeFavoriteById(prev.favouriteId as string);
    } else {
      const fav = await addFavorite(clip, sessionId, sessionName, sessionDate);
      favStatus.set(key, { favourited: true, favouriteId: fav.favouriteId });
    }
  } catch (error) {
    favStatus.set(key, prev); // revert on failure
    console.error('[Favorites] toggle failed:', error);
  } finally {
    favInFlight.delete(key);
    emitFav();
  }
}

export function markFavoritesRemoved(
  targets: { sessionId: string; ballNumber: number }[],
): void {
  if (targets.length === 0) return;
  for (const t of targets) {
    favStatus.set(clipKey(t.sessionId, t.ballNumber), {
      favourited: false,
      favouriteId: undefined,
    });
  }
  emitFav();
}

export async function addFavorite(
  clip: DeliveryClip,
  sessionId: string,
  sessionName: string,
  sessionDate: number,
  _onProgress?: (p: number) => void,
): Promise<FavoriteClip> {
  const response = await sessionService.addFavourite({
    session_id: sessionId,
    ball_number: clip.ballNumber,
    video_key: clip.videoKey ?? '',
    thumbnail_key: clip.thumbnailKey ?? '',
    json_key: clip.dataKey ?? '',
  });

  const favouriteId = response?.id;

  const favorite: FavoriteClip = {
    favouriteId,
    ballNumber: clip.ballNumber,
    isHighlight: clip.isHighlight,
    result: clip.result,
    detail: clip.detail,
    localVideoPath: clip.videoUrl ?? '',
    localThumbnailPath: (clip.thumbnail as any)?.uri ?? '',
    sessionId,
    sessionName,
    sessionDate,
    clipData: null,
    savedAt: Date.now(),
    videoKey: clip.videoKey ?? '',
    configVideoKey: clip.configVideoKey ?? '',
    thumbnailKey: clip.thumbnailKey ?? '',
    dataKey: clip.dataKey ?? '',
  };

  return favorite;
}

export async function removeFavoriteById(favouriteId: string): Promise<void> {
  await sessionService.deleteFavourites([favouriteId]);
}

export async function removeFavoritesByIds(ids: string[]): Promise<void> {
  const valid = ids.filter(Boolean);
  if (valid.length > 0) {
    await sessionService.deleteFavourites(valid);
  }
}
