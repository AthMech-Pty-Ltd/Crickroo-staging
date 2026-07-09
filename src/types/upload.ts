export interface ClipUrlRequest {
  count: number;
  isLastBatch: boolean;
  sessionId: string;
  startClipNumber: number;
}

export interface UploadChunk {
  filePath: string;
  presignedUrl: string;
  clipNumber: number;
  fileKey: string;
  sessionId: string;
}

export interface ClipUrl {
  clipNumber: number;
  fileKey: string;
  url: string;
}

export interface ClipUrlResponse {
  urls: ClipUrl[];
}

export interface FaceUrlRequest {
  count: number;
}

export interface FaceUrl {
  fileKey: string;
  url: string;
}

export interface FaceUrlResponse {
  urls: FaceUrl[];
}

export interface SessionStump {
  box_id: number;
  label: string;
  x1: number;
  x2: number;
  y1: number;
  y2: number;
  detected: boolean;
}

export interface SessionMeta {
  mode: 'group' | 'solo_batting' | 'solo_bowling';
}

export interface SessionConfigRequest {
  meta: SessionMeta;
  stump: SessionStump[];
  users: string[];
  platform: 'android' | 'ios';
  pitch_length: number;
  user_type?: 'coach' | 'player';
}

export interface SessionConfigResponse {
  message: string;
  s3Key?: string;
}

export interface ProfileImageUrlResponse {
  fileKey: string;
  url: string;
}

export interface StumpDetectionUrlRequest {
  sessionId: string;
}

export interface StumpDetectionUrlResponse {
  fileKey: string;
  url: string;
}
