import apiClient from './api/apiClient';
import { API_CONFIG } from '../config/api.config';

export interface PlayerSearchResult {
  user_id: string;
  cric_id: string;
  name: string;
  username: string;
  email: string;
  role: string;
}

export interface PlayerSearchResponse {
  results: PlayerSearchResult[];
  count: number;
}

export interface LinkCoachResponse {
  id: string;
  academy_id: string;
  player_user_id: string;
  target_coach_id: string;
  status: string;
  requested_at: string;
  coach_code: string;
}

export const playerService = {
  linkCoach: async (coachCode: string): Promise<LinkCoachResponse> => {
    const response = await apiClient.post<LinkCoachResponse>(
      API_CONFIG.ENDPOINTS.PLAYER_LINK_COACH,
      { coach_code: coachCode },
    );
    return response.data;
  },

  unlinkCoach: async (): Promise<void> => {
    await apiClient.delete(API_CONFIG.ENDPOINTS.PLAYER_UNLINK_COACH);
  },

  searchPlayers: async (
    q: string,
    limit = 20,
    offset = 0,
  ): Promise<PlayerSearchResponse> => {
    const response = await apiClient.get<PlayerSearchResponse>(
      API_CONFIG.ENDPOINTS.SEARCH_PLAYERS,
      { params: { q, limit, offset } },
    );
    return response.data;
  },
};
