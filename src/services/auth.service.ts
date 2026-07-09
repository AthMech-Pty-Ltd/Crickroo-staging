import apiClient from './api/apiClient';
import { API_CONFIG } from '../config/api.config';
import {
  AuthResponse,
  RegisterRequest,
  LoginRequest,
  SocialLoginRequest,
  RefreshRequest,
  LogoutRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  MessageResponse,
  isKnownRole,
} from '../types/auth';
import { storage } from '../utils/storage';
import { syncDeviceToken } from './deviceToken.service';

export class UnsupportedRoleError extends Error {
  role: string;
  constructor(role: string) {
    super(
      `This account uses an unsupported role (${role}). Please contact support.`,
    );
    this.name = 'UnsupportedRoleError';
    this.role = role;
  }
}

const ensureSupportedRole = async (role: unknown): Promise<void> => {
  if (!isKnownRole(role)) {
    await storage.clearAll();
    throw new UnsupportedRoleError(String(role));
  }
};

export const authService = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>(
        API_CONFIG.ENDPOINTS.AUTH.REGISTER,
        data,
      );

      if (response.data.access_token) {
        await ensureSupportedRole(response.data.user?.role);
        await storage.saveToken(response.data.access_token);
        await storage.saveRefreshToken(response.data.refresh_token);
        await storage.saveUser(response.data.user);
        syncDeviceToken().catch(err =>
          console.warn('Device token sync failed:', err),
        );
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>(
        API_CONFIG.ENDPOINTS.AUTH.LOGIN,
        data,
      );

      if (response.data.access_token) {
        await ensureSupportedRole(response.data.user?.role);
        await storage.saveToken(response.data.access_token);
        await storage.saveRefreshToken(response.data.refresh_token);
        await storage.saveUser(response.data.user);
        syncDeviceToken().catch(err =>
          console.warn('Device token sync failed:', err),
        );
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  socialLogin: async (data: SocialLoginRequest): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>(
        API_CONFIG.ENDPOINTS.AUTH.SOCIAL_LOGIN,
        data,
      );

      if (response.data.access_token) {
        await ensureSupportedRole(response.data.user?.role);
        await storage.saveToken(response.data.access_token);
        await storage.saveRefreshToken(response.data.refresh_token);
        await storage.saveUser(response.data.user);
        syncDeviceToken().catch(err =>
          console.warn('Device token sync failed:', err),
        );
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  refresh: async (data: RefreshRequest): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>(
        API_CONFIG.ENDPOINTS.AUTH.REFRESH,
        data,
      );

      if (response.data.access_token) {
        await ensureSupportedRole(response.data.user?.role);
        await storage.saveToken(response.data.access_token);
        await storage.saveRefreshToken(response.data.refresh_token);
        await storage.saveUser(response.data.user);
        syncDeviceToken().catch(err =>
          console.warn('Device token sync failed:', err),
        );
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  },

  logout: async (data: LogoutRequest): Promise<MessageResponse> => {
    try {
      const response = await apiClient.post<MessageResponse>(
        API_CONFIG.ENDPOINTS.AUTH.LOGOUT,
        data,
      );

      await storage.clearAll();

      return response.data;
    } catch (error) {
      await storage.clearAll();
      throw error;
    }
  },

  forgotPassword: async (
    data: ForgotPasswordRequest,
  ): Promise<MessageResponse> => {
    try {
      const response = await apiClient.post<MessageResponse>(
        API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD,
        data,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  resetPassword: async (
    data: ResetPasswordRequest,
  ): Promise<MessageResponse> => {
    try {
      const response = await apiClient.post<MessageResponse>(
        API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD,
        data,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  sendOtp: async (email: string): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>(
      API_CONFIG.ENDPOINTS.AUTH.SEND_OTP,
      { email },
    );
    return response.data;
  },

  verifyOtp: async (
    email: string,
    otp: string,
  ): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>(
      API_CONFIG.ENDPOINTS.AUTH.VERIFY_OTP,
      { email, otp },
    );
    return response.data;
  },

  verifyResetOtp: async (
    email: string,
    otp: string,
  ): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>(
      API_CONFIG.ENDPOINTS.AUTH.VERIFY_RESET_OTP,
      { email, otp },
    );
    return response.data;
  },

  deleteAccount: async (): Promise<MessageResponse> => {
    try {
      const response = await apiClient.delete<MessageResponse>(
        API_CONFIG.ENDPOINTS.USER_PROFILE,
      );
      await storage.clearAll();
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
