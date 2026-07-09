import apiClient from './api/apiClient';
import { API_CONFIG } from '../config/api.config';
import {
  AcademyPlayer,
  Batch,
  BatchPlayer,
  CreateBatchRequest,
  JoinRequestItem,
} from '../types/academy';

function asList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === 'object') {
    const arr = Object.values(data as Record<string, unknown>).find(v =>
      Array.isArray(v),
    );
    if (arr) return arr as T[];
  }
  return [];
}

export const academyService = {
  getCoachBatches: async (): Promise<Batch[]> => {
    const response = await apiClient.get<Batch[]>(
      API_CONFIG.ENDPOINTS.COACH_BATCHES,
    );
    return asList<Batch>(response.data);
  },

  createBatch: async (
    academyId: string,
    data: CreateBatchRequest,
  ): Promise<Batch> => {
    const response = await apiClient.post<Batch>(
      API_CONFIG.ENDPOINTS.ACADEMY.BATCHES(academyId),
      data,
    );
    return response.data;
  },

  renameBatch: async (
    academyId: string,
    batchId: string,
    name: string,
  ): Promise<void> => {
    await apiClient.patch(
      API_CONFIG.ENDPOINTS.ACADEMY.BATCH(academyId, batchId),
      { name },
    );
  },

  deleteBatch: async (academyId: string, batchId: string): Promise<void> => {
    await apiClient.delete(
      API_CONFIG.ENDPOINTS.ACADEMY.BATCH(academyId, batchId),
    );
  },

  getBatchPlayers: async (
    academyId: string,
    batchId: string,
  ): Promise<BatchPlayer[]> => {
    const response = await apiClient.get<BatchPlayer[]>(
      API_CONFIG.ENDPOINTS.ACADEMY.BATCH_PLAYERS(academyId, batchId),
    );
    return asList<BatchPlayer>(response.data);
  },

  assignPlayerToBatch: async (
    academyId: string,
    batchId: string,
    playerUserId: string,
  ): Promise<BatchPlayer> => {
    const response = await apiClient.post<BatchPlayer>(
      API_CONFIG.ENDPOINTS.ACADEMY.BATCH_PLAYERS(academyId, batchId),
      { player_user_id: playerUserId },
    );
    return response.data;
  },

  deletePlayer: async (
    academyId: string,
    playerUserId: string,
  ): Promise<void> => {
    await apiClient.delete(
      API_CONFIG.ENDPOINTS.ACADEMY.PLAYER(academyId, playerUserId),
    );
  },

  removeBatchPlayer: async (
    academyId: string,
    batchId: string,
    linkId: string,
  ): Promise<void> => {
    await apiClient.delete(
      API_CONFIG.ENDPOINTS.ACADEMY.BATCH_PLAYER(academyId, batchId, linkId),
    );
  },

  movePlayerBatch: async (
    academyId: string,
    playerUserId: string,
    newBatchId: string,
  ): Promise<BatchPlayer> => {
    const response = await apiClient.patch<BatchPlayer>(
      API_CONFIG.ENDPOINTS.ACADEMY.PLAYER_MOVE_BATCH(academyId, playerUserId),
      { new_batch_id: newBatchId },
    );
    return response.data;
  },

  getAcademyPlayers: async (
    academyId: string,
    assigned?: boolean,
  ): Promise<AcademyPlayer[]> => {
    const response = await apiClient.get<AcademyPlayer[]>(
      API_CONFIG.ENDPOINTS.ACADEMY.PLAYERS(academyId),
      assigned !== undefined ? { params: { assigned } } : undefined,
    );
    return asList<AcademyPlayer>(response.data);
  },

  getJoinRequests: async (): Promise<JoinRequestItem[]> => {
    const response = await apiClient.get<JoinRequestItem[]>(
      API_CONFIG.ENDPOINTS.ACADEMY.JOIN_REQUESTS,
    );
    return asList<JoinRequestItem>(response.data);
  },

  approveJoinRequest: async (requestId: string): Promise<void> => {
    await apiClient.post(
      API_CONFIG.ENDPOINTS.ACADEMY.JOIN_REQUEST_APPROVE(requestId),
      { batch_id: null },
    );
  },

  rejectJoinRequest: async (requestId: string): Promise<void> => {
    await apiClient.post(
      API_CONFIG.ENDPOINTS.ACADEMY.JOIN_REQUEST_REJECT(requestId),
      { batch_id: null },
    );
  },
};
