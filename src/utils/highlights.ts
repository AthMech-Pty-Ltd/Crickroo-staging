import { DeliveryClip } from '../types';
import { ASSETS } from '../constants/assets';

export function mapClipsToDeliveries(clips: any[]): DeliveryClip[] {
  const sorted = [...clips].sort((a, b) => {
    if (a.isHighlight && !b.isHighlight) return -1;
    if (!a.isHighlight && b.isHighlight) return 1;
    return a.ballNumber - b.ballNumber;
  });

  return sorted.map(clip => {
    const result = clip.pitch_map_outcome ?? '';
    const detail = clip.hit ?? '';

    return {
      id: clip.isHighlight ? 0 : clip.ballNumber,
      ballNumber: clip.ballNumber,
      isHighlight: clip.isHighlight,
      result,
      detail,
      isFavorite: clip.isFavourited ?? false,
      favouriteId: clip.favouriteId ?? undefined,
      thumbnail: clip.thumbnailUrl
        ? { uri: clip.thumbnailUrl }
        : ASSETS.IMAGES.ONBOARDING_1,
      videoUrl: clip.videoUrl,
      videoKey: clip.videoKey ?? '',
      configVideoKey: clip.configVideoKey ?? '',
      thumbnailKey: clip.thumbnailKey ?? '',
      dataKey: clip.dataKey ?? '',
    };
  });
}
