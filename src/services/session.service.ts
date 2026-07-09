import { SessionHighlightsResponse } from '../types/highlights';
import apiClient from './api/apiClient';
import { API_CONFIG } from '../config/api.config';
import {
  CreateSessionRequest,
  CreateSessionResponse,
  Session,
  SessionPlayersResponse,
} from '../types/session';
import { AppMode } from '../types/auth';

type RecentSessionDateResponse =
  | string
  | null
  | {
      date?: string | null;
      recent_date?: string | null;
      recent_session_date?: string | null;
      recentSession?: string | null;
    };

type SessionDatesResponse =
  | string[]
  | {
      dates?: string[];
      session_dates?: string[];
      sessionExist?: string[];
    };

const toDateKey = (value: string): string => value.slice(0, 10);

const normalizeRecentSessionDate = (
  data: RecentSessionDateResponse,
): string | null => {
  if (typeof data === 'string') return toDateKey(data);
  if (!data) return null;
  const recentDate =
    data.date ??
    data.recent_date ??
    data.recent_session_date ??
    data.recentSession ??
    null;
  return recentDate ? toDateKey(recentDate) : null;
};

const normalizeSessionDates = (data: SessionDatesResponse): string[] => {
  const dates = Array.isArray(data)
    ? data
    : data.dates ?? data.session_dates ?? data.sessionExist ?? [];
  return dates.map(toDateKey);
};

export const sessionService = {
  createSession: async (
    data: CreateSessionRequest,
  ): Promise<CreateSessionResponse> => {
    try {
      const response = await apiClient.post<CreateSessionResponse>(
        API_CONFIG.ENDPOINTS.SESSIONS,
        data,
      );
      return response.data;
    } catch (error) {
      console.error('Service Layer Error:', error);
      throw error;
    }
  },

  getLatestSessionDate: async (): Promise<string> => {
    const response = await apiClient.get<{ date: string }>(
      API_CONFIG.ENDPOINTS.SESSIONS_LATEST_DATE,
    );
    return response.data.date;
  },

  getRecentSessionDateByUser: async (
    userId: string,
    sessionMode?: AppMode,
    filter?: { scope?: 'own' | 'students'; playerCricId?: string },
  ): Promise<string | null> => {
    const params: Record<string, string> = {};
    if (sessionMode) params.session_mode = sessionMode;
    if (filter?.scope) params.scope = filter.scope;
    if (filter?.playerCricId) params.cric_id = filter.playerCricId;

    const response = await apiClient.get<RecentSessionDateResponse>(
      API_CONFIG.ENDPOINTS.SESSIONS_RECENT_BY_USER(userId),
      { params: Object.keys(params).length ? params : undefined },
    );
    return normalizeRecentSessionDate(response.data);
  },

  getSessionDatesByUser: async (
    userId: string,
    sessionMode?: AppMode,
    filter?: { scope?: 'own' | 'students'; playerCricId?: string },
  ): Promise<string[]> => {
    const params: Record<string, string> = {};
    if (sessionMode) params.session_mode = sessionMode;
    if (filter?.scope) params.scope = filter.scope;
    if (filter?.playerCricId) params.cric_id = filter.playerCricId;

    const response = await apiClient.get<SessionDatesResponse>(
      API_CONFIG.ENDPOINTS.SESSIONS_DATES_BY_USER(userId),
      { params: Object.keys(params).length ? params : undefined },
    );

    return normalizeSessionDates(response.data);
  },

  getSessions: async (
    date?: string,
    sessionMode?: AppMode,
    filter?: { scope?: 'own' | 'students'; playerCricId?: string },
  ): Promise<Session[]> => {
    try {
      const params: Record<string, string> = {};
      if (date) params.date = date;
      if (sessionMode) params.session_mode = sessionMode;
      if (filter?.scope) params.scope = filter.scope;
      if (filter?.playerCricId) params.cric_id = filter.playerCricId;
      const response = await apiClient.get<Session[]>(
        API_CONFIG.ENDPOINTS.SESSIONS,
        { params: Object.keys(params).length ? params : undefined },
      );
      return response.data;
    } catch (error) {
      console.error('Service Layer Error (getSessions):', error);
      throw error;
    }
  },

  endSession: async (sessionId: string): Promise<void> => {
    try {
      await apiClient.post(API_CONFIG.ENDPOINTS.SESSION_END(sessionId));
    } catch (error) {
      console.error('Service Layer Error (endSession):', error);
      throw error;
    }
  },

  addFavourite: async (payload: {
    session_id: string;
    ball_number: number;
    video_key: string;
    thumbnail_key: string;
    json_key: string;
  }): Promise<{ id: string }> => {
    try {
      const response = await apiClient.post<{ id: string }>(
        API_CONFIG.ENDPOINTS.FAVOURITES,
        payload,
      );
      return response.data;
    } catch (error) {
      console.error('Service Layer Error (addFavourite):', error);
      throw error;
    }
  },

  deleteFavourites: async (ids: string[]): Promise<void> => {
    try {
      const payload = { ids };
      console.log(
        'deleteFavourites payload:',
        JSON.stringify(payload, null, 2),
      );
      await apiClient.delete(API_CONFIG.ENDPOINTS.FAVOURITES, {
        data: payload,
      });
    } catch (error) {
      console.error('Service Layer Error (deleteFavourites):', error);
      throw error;
    }
  },

  getFavourites: async (
    page: number = 1,
    limit: number = 20,
    sessionMode?: AppMode,
  ): Promise<{
    items: {
      id: string;
      session_id: string;
      session_number: number;
      ball_number: number;
      video_url: string;
      thumbnail_url: string;
      data_url: string;
      created_at: string;
    }[];
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  }> => {
    try {
      const params: Record<string, any> = { page, limit };
      if (sessionMode) params.session_mode = sessionMode;
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.FAVOURITES, {
        params,
      });
      return response.data;
    } catch (error) {
      console.error('Service Layer Error (getFavourites):', error);
      throw error;
    }
  },

  generateHighlight: async (
    clips: string[],
  ): Promise<{ message: string; s3Key: string }> => {
    try {
      const response = await apiClient.post<{ message: string; s3Key: string }>(
        API_CONFIG.ENDPOINTS.HIGHLIGHTS_GENERATE,
        { watermark: true, clips },
      );
      return response.data;
    } catch (error) {
      console.error('Service Layer Error (generateHighlight):', error);
      throw error;
    }
  },

  getSessionHighlights: async (
    sessionId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<SessionHighlightsResponse> => {
    try {
      const response = await apiClient.get<SessionHighlightsResponse>(
        API_CONFIG.ENDPOINTS.SESSION_HIGHLIGHTS(sessionId),
        { params: { page, limit } },
      );
      console.log('Session highlights response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Service Layer Error (getSessionHighlights):', error);
      throw error;
    }
  },

  getSessionPlayers: async (
    sessionId: string,
  ): Promise<SessionPlayersResponse> => {
    try {
      const response = await apiClient.get<SessionPlayersResponse>(
        API_CONFIG.ENDPOINTS.SESSION_PLAYERS(sessionId),
      );
      return response.data;
    } catch (error) {
      console.error('Service Layer Error (getSessionPlayers):', error);
      throw error;
    }
  },
};
