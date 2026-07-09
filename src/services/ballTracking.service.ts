import apiClient from './api/apiClient';
import { API_CONFIG } from '../config/api.config';
import { BallTrajectoryResponse, BallDetail, BallNoteResponse } from '../types/ballTracking';

export interface BallOutcomeResponse {
  ball_id: string;
  updated: boolean;
}

export interface BallPlayersResponse {
  ball_id: string;
  batter_id: string | null;
  bowler_id: string | null;
}

export const ballTrackingService = {
  getTrajectory: async (ballId: string): Promise<BallTrajectoryResponse> => {
    const response = await apiClient.get<BallTrajectoryResponse>(
      API_CONFIG.ENDPOINTS.BALL_TRAJECTORY(ballId),
    );
    return response.data;
  },

  getBall: async (ballId: string): Promise<BallDetail> => {
    const response = await apiClient.get<BallDetail>(
      API_CONFIG.ENDPOINTS.BALL_DETAIL(ballId),
    );
    return response.data;
  },

  getPlayers: async (ballId: string): Promise<BallPlayersResponse> => {
    const response = await apiClient.get<BallPlayersResponse>(
      API_CONFIG.ENDPOINTS.BALL_PLAYERS(ballId),
    );
    return response.data;
  },

  updateOutcome: async (
    ballId: string,
    hit: string,
  ): Promise<BallOutcomeResponse> => {
    const response = await apiClient.patch<BallOutcomeResponse>(
      API_CONFIG.ENDPOINTS.BALL_OUTCOME(ballId),
      { hit },
    );
    return response.data;
  },

  updatePlayers: async (
    ballId: string,
    payload: { batter_id: string | null; bowler_id: string | null },
  ): Promise<BallOutcomeResponse> => {
    const response = await apiClient.patch<BallOutcomeResponse>(
      API_CONFIG.ENDPOINTS.BALL_PLAYERS(ballId),
      payload,
    );
    return response.data;
  },

  addNote: async (ballId: string, note: string): Promise<BallNoteResponse> => {
    const response = await apiClient.post<BallNoteResponse>(
      API_CONFIG.ENDPOINTS.BALL_NOTES(ballId),
      { note },
    );
    return response.data;
  },
};
