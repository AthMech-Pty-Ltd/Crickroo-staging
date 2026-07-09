import apiClient from './api/apiClient';
import { API_CONFIG } from '../config/api.config';

export interface UserPlanFeatures {
  create_highlights: boolean;
  ball_tracking: boolean;
  analytics: boolean;
  session_creation: boolean;
  view_highlights: boolean;
}

export type PlanSource =
  | 'free_tier'
  | 'trial'
  | 'individual_subscription'
  | 'academy';



export type BillingInterval = 'month' | 'year';

export interface PurchasePlanResponse {
  checkout_url: string;
  session_id: string;
  purchase_type: 'individual' | 'group';
  will_become_coach: boolean;
}

export interface PortalSessionResponse {
  portal_url: string;
}

export interface SubscriptionResponse {
  plan: string;
  status: string;
  is_active: boolean;
  cancel_at_period_end: boolean;
  current_period_end: string | null;
}

export interface UserPlanResponse {
  plan: string;
  plan_source: PlanSource;
  trial_active: boolean;
  trial_ends_at: string | null;
  is_academy_enrolled: boolean;
  academy_name: string | null;
  features: UserPlanFeatures;
}

export const planService = {
  getUserPlan: async (): Promise<UserPlanResponse> => {
    const response = await apiClient.get<UserPlanResponse>(
      API_CONFIG.ENDPOINTS.USER_PLAN,
    );
    return response.data;
  },

  purchasePlan: async (
    billingInterval: BillingInterval,
  ): Promise<PurchasePlanResponse> => {
    const response = await apiClient.post<PurchasePlanResponse>(
      API_CONFIG.ENDPOINTS.PAYMENTS_PURCHASE_PLAN,
      {
        quantity: 1,
        billing_interval: billingInterval,
      },
    );
    return response.data;
  },

  createPortalSession: async (): Promise<PortalSessionResponse> => {
    const response = await apiClient.post<PortalSessionResponse>(
      API_CONFIG.ENDPOINTS.PAYMENTS_PORTAL_SESSION,
      {},
    );
    return response.data;
  },

  getSubscription: async (): Promise<SubscriptionResponse> => {
    const response = await apiClient.get<SubscriptionResponse>(
      API_CONFIG.ENDPOINTS.PAYMENTS_SUBSCRIPTION,
    );
    return response.data;
  },
};
