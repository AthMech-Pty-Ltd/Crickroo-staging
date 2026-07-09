import { AppMode } from './auth';

export type SessionType = 'solo' | 'group';
export type SessionMode = 'batting' | 'bowling';

export interface PlayerInput {
  name: string;
  playerId: string;
}

export interface CreateSessionRequest {
  mode: SessionMode;
  numberOfPlayers: number;
  pitchLength: number;
  players: PlayerInput[];
  sessionName: string;
  sessionType: SessionType;
  // Whether the logged-in user is creating this as a coach or a player.
  sessionMode: AppMode;
}

export interface PlayerResponse {
  id: string;
  player_name: string;
  player_identifier: string;
}

export interface CreateSessionResponse {
  sessionId: string;
  folderPath: string;
  userId: string;
  sessionType: string;
  mode: string;
  pitchLength: number;
  players: PlayerResponse[];
}

export interface SessionPlayer {
  userId: string;
  cricId: string;
  name: string;
  role: string;
}

export interface SessionPlayersResponse {
  players: SessionPlayer[];
  coach: SessionPlayer | null;
}

export interface Session {
  sessionId: string;
  sessionNumber: number;
  sessionName: string;
  sessionType: string;
  mode: string;
  pitchLength: number;
  numberOfPlayers: number;
  players: PlayerResponse[];
  createdAt: string;
  endedAt?: string;
  totalBalls?: number;
  sessionThumbnailUrl?: string;
}

export interface SessionApiError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface SessionValidationError {
  detail: SessionApiError[];
}
