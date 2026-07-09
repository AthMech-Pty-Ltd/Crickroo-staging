import { ClipData } from './highlights';

export interface FavoriteClip {
  ballNumber: number;
  isHighlight: boolean;
  result: string;
  detail: string;
  localVideoPath: string;
  localThumbnailPath: string;
  sessionId: string;
  sessionName: string;
  sessionDate: number;
  clipData: ClipData | null;
  savedAt: number;
  videoKey: string;
  configVideoKey: string;
  thumbnailKey: string;
  dataKey: string;
  favouriteId?: string;
}
