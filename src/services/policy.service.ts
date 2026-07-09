import { NativeModules, Platform } from 'react-native';
import apiClient from './api/apiClient';
import { API_CONFIG } from '../config/api.config';
import { APP_CONFIG } from '../config/app.config';

export interface PolicyStatusResponse {
  accepted_policy_version?: string | null;
  requested_policy_version?: string;
  is_policy_current?: boolean;
  requires_policy_update?: boolean;
  [key: string]: unknown;
}

export interface PolicyAcceptRequest {
  accepted_from: string;
  app_version: string;
  device_info: {
    platform: string;
    model: string;
  };
}

const getDeviceModel = (): string => {
  const platformConstants = NativeModules.PlatformConstants ?? {};
  return (
    platformConstants.model ??
    platformConstants.Model ??
    platformConstants.deviceName ??
    `${Platform.OS} device`
  );
};

export const policyService = {
  getStatus: async (): Promise<PolicyStatusResponse> => {
    const response = await apiClient.get<PolicyStatusResponse>(
      API_CONFIG.ENDPOINTS.POLICY.STATUS,
    );
    return response.data;
  },

  accept: async (): Promise<void> => {
    const platform = Platform.OS;
    const payload: PolicyAcceptRequest = {
      accepted_from: platform,
      app_version: APP_CONFIG.version,
      device_info: {
        platform,
        model: getDeviceModel(),
      },
    };

    await apiClient.post(API_CONFIG.ENDPOINTS.POLICY.ACCEPT, payload);
  },
};
