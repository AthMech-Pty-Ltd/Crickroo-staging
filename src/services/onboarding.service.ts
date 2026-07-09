import apiClient from './api/apiClient';
import { API_CONFIG } from '../config/api.config';
import {
  OnboardingStatusResponse,
  PersonalProfileRequest,
  CricketProfileRequest,
  PlayingStyleRequest,
  AcademyDetailsRequest,
  OnboardingUserResponse,
  MessageResponse,
  OnboardingSummaryResponse,
} from '../types/onboarding';

export const onboardingService = {
  getStatus: async (): Promise<OnboardingStatusResponse> => {
    try {
      const response = await apiClient.get<OnboardingStatusResponse>(
        API_CONFIG.ENDPOINTS.ONBOARDING.STATUS,
      );
      return response.data;
    } catch (error) {
      console.error('Onboarding Service Error (getStatus):', error);
      throw error;
    }
  },

  getSummary: async (): Promise<OnboardingSummaryResponse> => {
    try {
      const response = await apiClient.get<OnboardingSummaryResponse>(
        API_CONFIG.ENDPOINTS.ONBOARDING.SUMMARY,
      );
      return response.data;
    } catch (error) {
      console.error('Onboarding Service Error (getSummary):', error);
      throw error;
    }
  },

  updatePersonalProfile: async (
    data: PersonalProfileRequest,
  ): Promise<OnboardingUserResponse> => {
    try {
      const response = await apiClient.patch<OnboardingUserResponse>(
        API_CONFIG.ENDPOINTS.ONBOARDING.PERSONAL_PROFILE,
        data,
      );
      return response.data;
    } catch (error) {
      console.error('Onboarding Service Error (updatePersonalProfile):', error);
      throw error;
    }
  },

  updateCricketProfile: async (
    data: CricketProfileRequest,
  ): Promise<OnboardingUserResponse> => {
    try {
      const response = await apiClient.patch<OnboardingUserResponse>(
        API_CONFIG.ENDPOINTS.ONBOARDING.CRICKET_PROFILE,
        data,
      );
      return response.data;
    } catch (error) {
      console.error('Onboarding Service Error (updateCricketProfile):', error);
      throw error;
    }
  },

  updatePlayingStyle: async (
    data: PlayingStyleRequest,
  ): Promise<OnboardingUserResponse> => {
    try {
      const response = await apiClient.patch<OnboardingUserResponse>(
        API_CONFIG.ENDPOINTS.ONBOARDING.PLAYING_STYLE,
        data,
      );
      return response.data;
    } catch (error) {
      console.error('Onboarding Service Error (updatePlayingStyle):', error);
      throw error;
    }
  },

  updateAcademyDetails: async (
    data: AcademyDetailsRequest,
  ): Promise<OnboardingUserResponse> => {
    try {
      const response = await apiClient.patch<OnboardingUserResponse>(
        API_CONFIG.ENDPOINTS.ONBOARDING.ACADEMY_DETAILS,
        data,
      );
      return response.data;
    } catch (error) {
      console.error('Onboarding Service Error (updateAcademyDetails):', error);
      throw error;
    }
  },

  completeOnboarding: async (): Promise<MessageResponse> => {
    try {
      const response = await apiClient.post<MessageResponse>(
        API_CONFIG.ENDPOINTS.ONBOARDING.COMPLETE,
      );
      return response.data;
    } catch (error) {
      console.error('Onboarding Service Error (completeOnboarding):', error);
      throw error;
    }
  },
};
