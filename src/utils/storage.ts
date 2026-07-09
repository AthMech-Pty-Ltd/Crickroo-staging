import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/auth';
import {
  OnboardingStatusResponse,
  OnboardingSummaryResponse,
} from '../types/onboarding';

const KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  CACHED_STATUS: 'cached_onboarding_status',
  CACHED_PROFILE_SUMMARY: 'cached_profile_summary',
};

export const storage = {
  saveToken: async (token: string) => {
    try {
      await AsyncStorage.setItem(KEYS.ACCESS_TOKEN, token);
    } catch (e) {
      console.error('Error saving access token', e);
    }
  },

  getToken: async () => {
    try {
      return await AsyncStorage.getItem(KEYS.ACCESS_TOKEN);
    } catch (e) {
      console.error('Error getting access token', e);
      return null;
    }
  },

  saveRefreshToken: async (token: string) => {
    try {
      await AsyncStorage.setItem(KEYS.REFRESH_TOKEN, token);
    } catch (e) {
      console.error('Error saving refresh token', e);
    }
  },

  getRefreshToken: async () => {
    try {
      return await AsyncStorage.getItem(KEYS.REFRESH_TOKEN);
    } catch (e) {
      console.error('Error getting refresh token', e);
      return null;
    }
  },

  saveUser: async (user: User) => {
    try {
      await AsyncStorage.setItem(KEYS.USER_DATA, JSON.stringify(user));
    } catch (e) {
      console.error('Error saving user data', e);
    }
  },

  getUser: async (): Promise<User | null> => {
    try {
      const data = await AsyncStorage.getItem(KEYS.USER_DATA);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Error getting user data', e);
      return null;
    }
  },

  saveCachedStatus: async (status: OnboardingStatusResponse) => {
    try {
      await AsyncStorage.setItem(KEYS.CACHED_STATUS, JSON.stringify(status));
    } catch (e) {
      console.error('Error saving cached status', e);
    }
  },

  getCachedStatus: async (): Promise<OnboardingStatusResponse | null> => {
    try {
      const data = await AsyncStorage.getItem(KEYS.CACHED_STATUS);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Error getting cached status', e);
      return null;
    }
  },

  saveCachedSummary: async (summary: OnboardingSummaryResponse) => {
    try {
      await AsyncStorage.setItem(
        KEYS.CACHED_PROFILE_SUMMARY,
        JSON.stringify(summary),
      );
    } catch (e) {
      console.error('Error saving cached profile summary', e);
    }
  },

  getCachedSummary: async (): Promise<OnboardingSummaryResponse | null> => {
    try {
      const data = await AsyncStorage.getItem(KEYS.CACHED_PROFILE_SUMMARY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Error getting cached profile summary', e);
      return null;
    }
  },

  clearAll: async () => {
    try {
      await AsyncStorage.clear();
    } catch (e) {
      console.error('Error clearing storage', e);
    }
  },
};
