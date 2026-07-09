
import React, {

  createContext,

  ReactNode,

  useCallback,

  useContext,

  useEffect,

  useMemo,

  useState,

} from 'react';

import { Alert, AppState, Linking } from 'react-native';
import { WEB_CONFIG } from '../config/web.config';

import {

  BillingInterval,

  planService,

  SubscriptionResponse,

  UserPlanResponse,

} from '../services/plan.service';

interface PlanContextType {

  planData: UserPlanResponse | null;

  subscriptionData: SubscriptionResponse | null;

  isLoadingPlan: boolean;

  isPaymentLoading: boolean;

  isPremium: boolean;

  isTrial: boolean;

  planSource: UserPlanResponse['plan_source'] | null;

  canCreateHighlights: boolean;

  canUseBallTracking: boolean;

  canUseAnalytics: boolean;

  canRecordSessions: boolean;

  canViewHighlights: boolean;

  refreshPlan: () => Promise<void>;

  purchaseIndividualPlan: (billingInterval: BillingInterval) => Promise<void>;

  openManageAccount: () => Promise<void>;

}

const PlanContext = createContext<PlanContextType | undefined>(undefined);

export const PlanProvider: React.FC<{ children: ReactNode }> = ({

  children,

}) => {

  const [planData, setPlanData] = useState<UserPlanResponse | null>(null);

  const [subscriptionData, setSubscriptionData] =

    useState<SubscriptionResponse | null>(null);

  const [isLoadingPlan, setIsLoadingPlan] = useState(false);

  const [isPaymentLoading] = useState(false);

  const refreshPlan = useCallback(async () => {

    try {

      setIsLoadingPlan(true);

      const [plan, subscription] = await Promise.all([

        planService.getUserPlan(),

        planService.getSubscription().catch(() => null),

      ]);

      setPlanData(plan);

      setSubscriptionData(subscription);

    } catch (err) {

      console.error('Failed to refresh plan:', err);

    } finally {

      setIsLoadingPlan(false);

    }

  }, []);

  useEffect(() => {

    refreshPlan();

  }, [refreshPlan]);

  useEffect(() => {

    const appStateSubscription = AppState.addEventListener('change', state => {

      if (state === 'active') {

        refreshPlan();

      }

    });

    return () => appStateSubscription.remove();

  }, [refreshPlan]);

  const openUrl = useCallback(async (url: string) => {

    const supported = await Linking.canOpenURL(url);

    if (!supported) {

      Alert.alert('Unable to open link', 'Please try again later.');

      return;

    }

    await Linking.openURL(url);

  }, []);

  const purchaseIndividualPlan = useCallback(
    async (_billingInterval: BillingInterval) => {
      await openUrl(WEB_CONFIG.billingUrl);
    },
    [openUrl],
  );

  const openManageAccount = useCallback(async () => {
    await openUrl(WEB_CONFIG.accountUrl);
  }, [openUrl]);

  const value = useMemo<PlanContextType>(() => {

    const features = planData?.features;

    return {

      planData,

      subscriptionData,

      isLoadingPlan,

      isPaymentLoading,

      isPremium: planData?.plan === 'premium',

      isTrial: Boolean(planData?.trial_active),

      planSource: planData?.plan_source ?? null,

      canCreateHighlights: Boolean(features?.create_highlights),

      canUseBallTracking: Boolean(features?.ball_tracking),

      canUseAnalytics: Boolean(features?.analytics),

      canRecordSessions: Boolean(features?.session_creation),

      canViewHighlights: Boolean(features?.view_highlights),

      refreshPlan,

      purchaseIndividualPlan,

      openManageAccount,

    };

  }, [

    planData,

    subscriptionData,

    isLoadingPlan,

    isPaymentLoading,

    refreshPlan,

    purchaseIndividualPlan,

    openManageAccount,

  ]);

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;

};

export const usePlanContext = () => {

  const context = useContext(PlanContext);

  if (!context) {

    throw new Error('usePlanContext must be used within a PlanProvider');

  }

  return context;

};

