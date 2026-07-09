import { ImageSourcePropType } from 'react-native';

export type HighlightSessionType = string;

export interface HighlightSession {
  sessionId: string;
  sessionNumber: number;
  title: string;
  subtitle: string;
  mode: string;
  sessionType?: string;
  type: HighlightSessionType;
  duration: string;
  balls: number;
  thumbnail: ImageSourcePropType;
  isFavorite?: boolean;
}

export interface HighlightClip {
  ballNumber: number;
  isHighlight: boolean;
  fileName: string;
  videoUrl: string;
  videoKey: string;
  configVideoKey: string;
  thumbnailUrl: string;
  thumbnailKey: string;
  dataKey: string;
  pitch_map_outcome?: string | null;
  hit?: string | null;
  isFavourited?: boolean;
  favouriteId?: string | null;
}

export interface SessionHighlightsResponse {
  highlights: HighlightClip[];
  page: number;
  limit: number;
  totalBalls: number;
  totalPages: number;
}

// Partial interface — only ball_id is used currently.
// Full fields (pose_segment, sequence, etc.) will be integrated once analytics are ready.
export interface ClipData {
  user_id: string;
  session_id: string;
  subsession_id: string;
  ball_id: number;
  video_paths: string[];
  start_total_frame: number;
  mode: string;
  start_frame: number;
  end_frame: number;
}

export interface DeliveryClip {
  id: number;
  ballNumber: number;
  isHighlight: boolean;
  result: string;
  detail: string;
  thumbnail: ImageSourcePropType;
  videoUrl?: string;
  videoKey?: string;
  configVideoKey?: string;
  thumbnailKey?: string;
  dataKey?: string;
  isFavorite?: boolean;
  favouriteId?: string;
}

export interface SessionHighlightDetail extends HighlightSession {
  deliveries: DeliveryClip[];
}
