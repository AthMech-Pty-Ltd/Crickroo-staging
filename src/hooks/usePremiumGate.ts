import { Alert } from 'react-native';
import { usePlan } from './usePlan';

export type PremiumFeature =
  | 'analytics'
  | 'ball_tracking'
  | 'create_highlights'
  | 'coach_mode';

const FEATURE_COPY: Record<PremiumFeature, { title: string; message: string }> = {
  analytics: {
    title: 'Upgrade to Player Pro',
    message:
      'Advanced analytics are available on Player Pro. You can still record sessions and watch videos for free.',
  },
  ball_tracking: {
    title: 'Upgrade to Player Pro',
    message:
      'Ball tracking, speed, line and length, pitch maps and trajectory are available on Player Pro.',
  },
  create_highlights: {
    title: 'Upgrade to Player Pro',
    message:
      'Create Your Highlights is available on Player Pro. You can still record sessions and watch videos for free.',
  },
  coach_mode: {
    title: 'Coach Mode requires academy setup',
    message:
      'Coach Mode unlocks after your academy is set up with AthMech. Contact our team to get started.',
  },
};

export const usePremiumGate = () => {
  const {
    canUseAnalytics,
    canUseBallTracking,
    canCreateHighlights,
    purchaseIndividualPlan,
  } = usePlan();

  const hasFeature = (feature: PremiumFeature) => {    switch (feature) {
      case 'analytics':
        return canUseAnalytics;
      case 'ball_tracking':
        return canUseBallTracking;
      case 'create_highlights':
        return canCreateHighlights;
      case 'coach_mode':
        return false;
      default:
        return false;
    }
  };

  const showUpgradePrompt = (feature: PremiumFeature) => {    const copy = FEATURE_COPY[feature];

    if (feature === 'coach_mode') {
      Alert.alert(copy.title, copy.message, [{ text: 'OK' }]);
      return;
    }

    Alert.alert(copy.title, copy.message, [
      { text: 'Not now', style: 'cancel' },
      {
        text: 'Upgrade Plan',
        onPress: () => purchaseIndividualPlan('month'),
      },
    ]);
  };

  const requireFeature = (
    feature: PremiumFeature,
    action: () => void | Promise<void>,
  ) => {
    if (!hasFeature(feature)) {
      showUpgradePrompt(feature);
      return;
    }

    return action();
  };

  return {
    hasFeature,
    requireFeature,
    showUpgradePrompt,
  };
};
