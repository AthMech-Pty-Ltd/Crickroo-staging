import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
  Platform,
  Alert,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInUp,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeftIcon,
  SignOutIcon,
  UserIcon,
  StackSimpleIcon,
  QuestionIcon,
  CalendarDotIcon,
  IdentificationBadgeIcon,
  CheckCircleIcon,
  TrashIcon,
  CrownIcon,
} from 'phosphor-react-native';
import CoachIcon from '../../../assets/images/coach.svg';
import { useHeaderAnimation } from '../../../hooks/useHeaderAnimation';
import { styles } from './styles';
import { ProfileListItem } from '../../../components/common/ProfileListItem';
import { BottomSheet } from '../../../components/common/BottomSheet';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import { colors } from '../../../theme/colors';
import { UserRole, AppMode, isCoachRole } from '../../../types/auth';
import { LinkedCoach } from '../../../types/onboarding';
import { usePlan } from '../../../hooks/usePlan';
import LinearGradient from 'react-native-linear-gradient';

interface ProfileScreenProps {
  onBack?: () => void;
  onOptionPress: (id: string) => void | Promise<void>;
  isLoading?: boolean;
  hideHeader?: boolean;
  hideProfileDetails?: boolean;
  role?: UserRole;
  coachCode?: string;
  playerCount?: number;
  batchCount?: number;
  cricId?: string;
  linkedCoach?: LinkedCoach | null;
  mode?: AppMode;
  onSwitchMode?: (mode: AppMode) => void;
  onLinkCoach?: (coachCode: string) => Promise<void>;
  onUnlinkCoach?: () => Promise<void>;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onBack,
  onOptionPress,
  isLoading = false,
  hideHeader = false,
  hideProfileDetails = false,
  role,
  playerCount = 0,
  batchCount = 0,
  cricId,
  linkedCoach = null,
  mode = 'coach',
  onSwitchMode,
  onLinkCoach,
  onUnlinkCoach,
}) => {
  const isCoach = isCoachRole(role);
  const { headerStyle } = useHeaderAnimation();

  const lastCoachRef = useRef<LinkedCoach | null>(null);
  if (linkedCoach) lastCoachRef.current = linkedCoach;
  const coachForModal = linkedCoach ?? lastCoachRef.current;

  const [showLinkCoachModal, setShowLinkCoachModal] = useState(false);

  const {
    planData,
    isLoadingPlan,
    isPaymentLoading,
    purchaseIndividualPlan,
    openManageAccount,
  } = usePlan();

  const handleUpgradePlan = async () => {
    await purchaseIndividualPlan('month');
  };

  const handleManageAccount = async () => {
    await openManageAccount();
  };

  const getSubscriptionDetails = () => {
    if (isLoadingPlan) {
      return {
        title: 'Loading...',
        subtitle: 'Fetching plan details',
        icon: <ActivityIndicator size="small" color={colors.neutrals.white} />,
        iconContainerStyle: undefined,
      };
    }

    const planSource = planData?.plan_source || 'free_tier';
    console.log('[ProfilePlan]', {
      role,
      planData,
      planSource: planData?.plan_source,
      plan: planData?.plan,
      trialActive: planData?.trial_active,
    });

    const academyName = planData?.academy_name;

    if (planSource === 'academy') {
      return {
        title: 'Academy Plan',
        subtitle: academyName ? `Managed by ${academyName}` : 'Academy managed',
        icon: <CalendarDotIcon size={20} color={colors.neutrals.white} />,
        iconContainerStyle: undefined,
      };
    }

    if (planData?.plan === 'premium') {
      return {
        title: 'Premium Plan',
        subtitle: 'Active',
        icon: <CalendarDotIcon size={20} color={colors.neutrals.white} />,
        iconContainerStyle: undefined,
      };
    }

    if (planSource === 'trial' || planData?.trial_active) {
      return {
        title: 'Free Trial',
        subtitle: 'Trial active',
        icon: <CalendarDotIcon size={20} color={colors.neutrals.white} />,
        iconContainerStyle: undefined,
      };
    }

    if (planSource === 'individual_subscription') {
      return {
        title: 'Player Pro',
        subtitle: 'Active',
        icon: (
          <LinearGradient
            colors={['#FFA366', '#D65600']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <CrownIcon
              size={20}
              color={colors.neutrals.black}
              weight="regular"
            />
          </LinearGradient>
        ),
        iconContainerStyle: { backgroundColor: 'transparent' },
      };
    }

    return {
      title: 'Free Plan',
      subtitle: 'Basic access',
      icon: <CalendarDotIcon size={20} color={colors.neutrals.white} />,
      iconContainerStyle: undefined,
    };
  };

  const subscription = getSubscriptionDetails();

  const [showLinkedCoachModal, setShowLinkedCoachModal] = useState(false);
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [coachCodeInput, setCoachCodeInput] = useState('');
  const [isLinking, setIsLinking] = useState(false);
  const [isUnlinking, setIsUnlinking] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const logoutScale = useSharedValue(1);
  const deleteScale = useSharedValue(1);

  const logoutScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoutScale.value }],
  }));

  const deleteScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: deleteScale.value }],
  }));

  const handleLinkCoach = async () => {
    const trimmed = coachCodeInput.trim();
    if (!trimmed || !onLinkCoach) return;
    setLinkError(null);
    try {
      setIsLinking(true);
      await onLinkCoach(trimmed);
      setShowLinkCoachModal(false);
      setCoachCodeInput('');
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message ??
        err?.message ??
        'Something went wrong';
      setLinkError(msg);
    } finally {
      setIsLinking(false);
    }
  };

  const Container = hideHeader ? View : SafeAreaView;

  return (
    <Container
      style={styles.container}
      {...(!hideHeader ? { edges: ['top', 'left', 'right'] } : {})}
    >
      {!hideHeader && (
        <Animated.View style={[styles.header, headerStyle]}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <ArrowLeftIcon size={24} color={colors.neutrals.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
        </Animated.View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View
          style={styles.menuGroup}
          entering={FadeInUp.delay(100).duration(380)}
        >
          {cricId ? (
            <>
              <ProfileListItem
                title="Cric ID"
                subtitle={cricId}
                onPress={() => {}}
                icon={
                  <IdentificationBadgeIcon
                    size={20}
                    color={colors.neutrals.white}
                  />
                }
                hideChevron
              />
              <View style={styles.divider} />
            </>
          ) : null}
          {!hideProfileDetails && (
            <>
              <ProfileListItem
                title="Profile Details"
                onPress={() => onOptionPress('profile_details')}
                icon={<UserIcon size={20} color={colors.neutrals.white} />}
              />
              <View style={styles.divider} />
            </>
          )}
          <ProfileListItem
            title="Customised Sessions"
            onPress={() => onOptionPress('custom_sessions')}
            icon={<StackSimpleIcon size={20} color={colors.neutrals.white} />}
          />
          <View style={styles.divider} />
          <ProfileListItem
            title="Help & Support"
            onPress={() => onOptionPress('help_support')}
            icon={<QuestionIcon size={20} color={colors.neutrals.white} />}
          />
        </Animated.View>

        <Animated.Text
          style={styles.sectionTitle}
          entering={FadeInUp.delay(200).duration(300)}
        >
          SUBSCRIPTION
        </Animated.Text>
        <Animated.View
          style={styles.subscriptionCard}
          entering={FadeInUp.delay(240).duration(380)}
        >
          <ProfileListItem
            title={subscription.title}
            subtitle={subscription.subtitle}
            onPress={() => {}}
            icon={subscription.icon}
            iconContainerStyle={subscription.iconContainerStyle}
            hideChevron
          />

          {!isLoadingPlan && (
            <View style={styles.subscriptionActions}>
              {planData?.plan === 'premium' ||
              planData?.plan_source === 'academy' ? (
                <Button
                  label="MANAGE ACCOUNT"
                  variant="outline_dark"
                  loading={isPaymentLoading}
                  disabled={isPaymentLoading}
                  onPress={handleManageAccount}
                  style={styles.subscriptionActionButton}
                />
              ) : (
                <Button
                  label="UPGRADE PLAN"
                  variant="primary"
                  loading={isPaymentLoading}
                  disabled={isPaymentLoading}
                  onPress={handleUpgradePlan}
                  style={styles.subscriptionActionButton}
                />
              )}
            </View>
          )}
        </Animated.View>

        <Animated.Text
          style={styles.sectionTitle}
          entering={FadeInUp.delay(340).duration(300)}
        >
          {isCoach ? 'ACCOUNT TYPE' : 'COACH DETAILS'}
        </Animated.Text>
        <Animated.View
          style={styles.coachCard}
          entering={FadeInUp.delay(380).duration(380)}
        >
          {isCoach ? (
            <ProfileListItem
              title={mode === 'coach' ? 'Coach Mode' : 'Player Mode'}
              subtitle={
                mode === 'coach'
                  ? `${playerCount} Players & ${batchCount} Batches`
                  : 'View your own Stats and Sessions'
              }
              onPress={() => {}}
              hideChevron
              icon={
                mode === 'coach' ? (
                  <CoachIcon width={20} height={20} />
                ) : (
                  <UserIcon size={20} color={colors.neutrals.white} />
                )
              }
              rightElement={
                <TouchableOpacity
                  style={styles.switchButton}
                  activeOpacity={0.8}
                  onPress={() => setShowSwitchModal(true)}
                >
                  <Text style={styles.switchButtonText}>SWITCH</Text>
                </TouchableOpacity>
              }
            />
          ) : linkedCoach ? (
            <ProfileListItem
              title="Linked Coach"
              subtitle={`${linkedCoach.name} (${linkedCoach.coach_code})`}
              onPress={() => setShowLinkedCoachModal(true)}
              icon={
                <IdentificationBadgeIcon
                  size={20}
                  color={colors.neutrals.white}
                />
              }
            />
          ) : (
            <ProfileListItem
              title="Link to a Coach"
              subtitle="Connect with your coach"
              onPress={() => setShowLinkCoachModal(true)}
              icon={
                <IdentificationBadgeIcon
                  size={20}
                  color={colors.neutrals.white}
                />
              }
            />
          )}
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(460).duration(380)}>
          <Pressable
            onPressIn={() => {
              logoutScale.value = withSpring(0.97, {
                damping: 20,
                stiffness: 400,
              });
            }}
            onPressOut={() => {
              logoutScale.value = withSpring(1.0, {
                damping: 20,
                stiffness: 400,
              });
            }}
            onPress={async () => {
              setIsLoggingOut(true);
              try {
                await onOptionPress('logout');
              } finally {
                setIsLoggingOut(false);
              }
            }}
            disabled={isLoading || isLoggingOut || isDeleting}
          >
            <Animated.View style={[styles.logoutButton, logoutScaleStyle]}>
              <View style={styles.logoutIconContainer}>
                {isLoggingOut ? (
                  <ActivityIndicator size="small" color={colors.error[65]} />
                ) : (
                  <SignOutIcon size={20} color={colors.error[65]} />
                )}
              </View>
              <Text style={styles.logoutText}>Log Out</Text>
            </Animated.View>
          </Pressable>

          <Pressable
            onPressIn={() => {
              deleteScale.value = withSpring(0.97, {
                damping: 20,
                stiffness: 400,
              });
            }}
            onPressOut={() => {
              deleteScale.value = withSpring(1.0, {
                damping: 20,
                stiffness: 400,
              });
            }}
            onPress={() => {
              Alert.alert(
                'Delete Account',
                'Are you sure you want to delete your account? This action is permanent and cannot be undone.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                      setIsDeleting(true);
                      try {
                        await onOptionPress('delete_account');
                      } finally {
                        setIsDeleting(false);
                      }
                    },
                  },
                ],
              );
            }}
            disabled={isLoading || isLoggingOut || isDeleting}
            style={{ marginTop: 16 }}
          >
            <Animated.View style={[styles.logoutButton, deleteScaleStyle]}>
              <View style={styles.logoutIconContainer}>
                {isDeleting ? (
                  <ActivityIndicator size="small" color={colors.error[65]} />
                ) : (
                  <TrashIcon size={20} color={colors.error[65]} />
                )}
              </View>
              <Text style={styles.logoutText}>Delete Account</Text>
            </Animated.View>
          </Pressable>
        </Animated.View>
      </ScrollView>

      <BottomSheet
        isVisible={showLinkCoachModal}
        title="Link to a Coach"
        onClose={() => {
          setShowLinkCoachModal(false);
          setCoachCodeInput('');
          setLinkError(null);
        }}
      >
        <Text style={styles.modalSubtitle}>
          Enter coach code to share your data
        </Text>
        <View style={styles.modalField}>
          <Input
            label="Coach Code"
            value={coachCodeInput}
            onChangeText={text => {
              setCoachCodeInput(text);
              if (linkError) setLinkError(null);
            }}
            placeholder="Enter coach code"
            autoCapitalize="characters"
          />
          {linkError ? (
            <Text style={styles.modalError}>{linkError}</Text>
          ) : null}
        </View>
        <Button
          label="LINK TO COACH"
          variant="primary"
          disabled={!coachCodeInput.trim() || isLinking}
          loading={isLinking}
          onPress={handleLinkCoach}
          style={styles.modalButton}
        />
      </BottomSheet>

      <BottomSheet
        isVisible={showLinkedCoachModal}
        title="Linked Coach"
        onClose={() => setShowLinkedCoachModal(false)}
      >
        <Text style={styles.modalSubtitle}>
          Your training data is shared with
        </Text>
        <View style={styles.linkedCoachCard}>
          <View style={styles.linkedCoachNameRow}>
            <IdentificationBadgeIcon size={18} color={colors.success.main} />
            <Text style={styles.linkedCoachName}>{coachForModal?.name}</Text>
          </View>
          <Text style={styles.linkedCoachCode}>
            Code: {coachForModal?.coach_code}
          </Text>
          {coachForModal?.academy_name ? (
            <Text style={styles.linkedCoachMeta}>
              {coachForModal.academy_name}
              {coachForModal.batch_name ? ` · ${coachForModal.batch_name}` : ''}
            </Text>
          ) : null}
        </View>
        <Button
          label="UNLINK COACH"
          variant="outline_dark"
          loading={isUnlinking}
          disabled={isUnlinking}
          onPress={async () => {
            if (!onUnlinkCoach) return;
            try {
              setIsUnlinking(true);
              await onUnlinkCoach();
              setShowLinkedCoachModal(false);
            } catch {
            } finally {
              setIsUnlinking(false);
            }
          }}
          style={[styles.modalButton, styles.unlinkButton]}
          textStyle={styles.unlinkButtonText}
        />
      </BottomSheet>

      <BottomSheet
        isVisible={showSwitchModal}
        title="Switch Account Type"
        onClose={() => setShowSwitchModal(false)}
      >
        {(
          [
            {
              key: 'coach',
              title: 'Coach Mode',
              subtitle: 'Manage Players and Batches',
              icon: <CoachIcon width={22} height={22} />,
            },
            {
              key: 'player',
              title: 'Player Mode',
              subtitle: 'View your own Stats and Sessions',
              icon: <UserIcon size={22} color={colors.neutrals.white} />,
            },
          ] as const
        ).map(option => {
          const selected = mode === option.key;
          return (
            <TouchableOpacity
              key={option.key}
              style={[styles.modeOption, selected && styles.modeOptionActive]}
              activeOpacity={0.8}
              onPress={() => {
                setShowSwitchModal(false);
                if (selected) return;
                if (Platform.OS === 'ios') {
                  setTimeout(() => onSwitchMode?.(option.key), 320);
                } else {
                  onSwitchMode?.(option.key);
                }
              }}
            >
              <View style={styles.modeOptionIcon}>{option.icon}</View>
              <View style={styles.modeOptionInfo}>
                <Text style={styles.modeOptionTitle}>{option.title}</Text>
                <Text style={styles.modeOptionSubtitle}>{option.subtitle}</Text>
              </View>
              {selected && (
                <CheckCircleIcon
                  size={22}
                  color={colors.success.main}
                  weight="regular"
                />
              )}
            </TouchableOpacity>
          );
        })}
      </BottomSheet>
    </Container>
  );
};
