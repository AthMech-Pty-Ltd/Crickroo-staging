import React, { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import {
  Alert,
  BackHandler,
  ToastAndroid,
  Platform,
  View,
  StyleSheet,
} from 'react-native';
import { SplashScreen } from '../screens/SplashScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { SignInScreen } from '../screens/Auth/SignInScreen';
import { ResetEmailScreen } from '../screens/Auth/ResetEmailScreen';
import { RegistrationFlow } from '../screens/Auth/RegistrationFlow';
import { HomeScreen } from '../screens/HomeScreen';
import { PlanProvider } from '../store/PlanContext';
import { PolicyConsentSheet } from '../components/common/PolicyConsentSheet';

import { CameraScreen } from '../screens/CameraScreen';
import { CreateSessionScreen } from '../screens/Session/CreateSession';
import { CreateNewSessionScreen } from '../screens/Session/CreateNewSession';
import { SessionSummaryScreen } from '../screens/SessionSummaryScreen';
import { ProfileDetailsScreen } from '../screens/Profile/ProfileDetailsScreen';
import { PersonalProfileScreen } from '../screens/Profile/PersonalProfileScreen';
import { FaceRecognitionScreen } from '../screens/Profile/FaceRecognitionScreen';
import { AppPermissionsScreen } from '../screens/Profile/AppPermissionsScreen';
import { CricketProfileScreen } from '../screens/Profile/CricketProfileScreen';
import { PlayingStyleScreen } from '../screens/Profile/PlayingStyleScreen';
import { HighlightPlaybackScreen } from '../screens/Highlights/HighlightPlaybackScreen';
import { HighlightReelScreen } from '../screens/Highlights/HighlightReelScreen';
import { HelpSupportScreen } from '../screens/Profile/HelpSupportScreen';
import { NotificationsScreen } from '../screens/Profile/NotificationsScreen';
import { CustomSessionsScreen } from '../screens/Profile/CustomSessionsScreen';
import messaging from '@react-native-firebase/messaging';
import { DeliveryClip } from '../types';
import { RootScreen, CreateSessionResponse } from '../types';
import { SessionPlayer } from '../types/session';
import { storage } from '../utils/storage';

import { useAuth } from '../hooks/useAuth';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { authService, UnsupportedRoleError } from '../services/auth.service';
import { onboardingService } from '../services/onboarding.service';
import { policyService } from '../services/policy.service';
import {
  getFirebaseIdToken,
  socialSignOut,
  SocialProvider,
  SocialSignInCancelledError,
} from '../services/social.service';
import { SelectRole } from '../screens/Auth/RegistrationFlow/steps/SelectRole';
import { OnboardingStep, OnboardingSummaryResponse } from '../types/onboarding';
import { UserRole, AppMode, isCoachRole } from '../types/auth';
import { getIsConnected, isNetworkError } from '../utils/network';

export const RootNavigator: React.FC = () => {
  const {
    isAuthenticated,
    setIsAuthenticated,
    resetRegistration,
    updateRegistrationFields,
  } = useAuth();
  const { isConnected } = useNetworkStatus();
  const [rootScreen, setRootScreen] = useState<RootScreen>(
    isAuthenticated ? 'dashboard' : 'splash',
  );
  const [loading, setLoading] = useState(false);
  const [pendingNotification, setPendingNotification] = useState<any>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionName, setSessionName] = useState<string>('');
  const [sessionDate, setSessionDate] = useState<number>(Date.now());
  const [sessionNumber, setSessionNumber] = useState<number>(0);
  const [sessionTag, setSessionTag] = useState<string>('');
  const [highlightMode, setHighlightMode] = useState<string>('');
  const [reelDeliveries, setReelDeliveries] = useState<DeliveryClip[]>([]);
  const [reelPlayers, setReelPlayers] = useState<SessionPlayer[]>([]);
  const [reelInitialIndex, setReelInitialIndex] = useState(0);
  const [reelCurrentPage, setReelCurrentPage] = useState(1);
  const [reelTotalPages, setReelTotalPages] = useState(0);
  const [sessionMode, setSessionMode] = useState<'group' | 'solo'>('solo');
  const [sessionPlayMode, setSessionPlayMode] = useState<'batting' | 'bowling'>(
    'batting',
  );
  const [sessionUsers, setSessionUsers] = useState<string[]>([]);
  const [sessionPitchLength, setSessionPitchLength] = useState<number>(22);
  const [finalTimer, setFinalTimer] = useState(0);
  const [registrationStep, setRegistrationStep] = useState(0);
  const [pendingSocialToken, setPendingSocialToken] = useState<string | null>(
    null,
  );
  const [socialRole, setSocialRole] = useState<'player' | 'coach'>('player');
  const [socialProvider, setSocialProvider] = useState<'Google' | 'Apple'>(
    'Google',
  );
  const socialInProgress = React.useRef(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isSplashDone, setIsSplashDone] = useState(false);
  const [pendingScreen, setPendingScreen] = useState<RootScreen | null>(null);
  const [profileSummary, setProfileSummary] =
    useState<OnboardingSummaryResponse | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [homeSkeletonShown, setHomeSkeletonShown] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | undefined>(undefined);
  const [coachCode, setCoachCode] = useState<string | undefined>(undefined);
  const [academyId, setAcademyId] = useState<string | undefined>(undefined);
  const [cricId, setCricId] = useState<string | undefined>(undefined);
  // Active mode (coach/player). Coaches default to coach mode and can switch;
  const [mode, setMode] = useState<AppMode>('player');
  const [showPolicySheet, setShowPolicySheet] = useState(false);
  const [policyGateTarget, setPolicyGateTarget] =
    useState<RootScreen>('dashboard');
  const [acceptingPolicy, setAcceptingPolicy] = useState(false);

  const refreshUserRole = useCallback(async () => {
    const user = await storage.getUser();
    setUserRole(user?.role);
    setCoachCode(user?.coach_code);
    setAcademyId(user?.academy_id);
    setCricId(user?.cric_id);
    setMode(isCoachRole(user?.role) ? 'coach' : 'player');
  }, []);

  useEffect(() => {
    if (isAuthenticated && pendingNotification) {
      const sessId = pendingNotification.data?.session_id;
      const sessNum = pendingNotification.data?.session_number;
      if (sessId) {
        setSessionId(sessId);
        setSessionName(`Session #${sessNum || ''}`);
        setSessionDate(Date.now());
        setSessionTag('Highlights');
        setHighlightMode('batting');
        setRootScreen('highlight_playback');
      }
      setPendingNotification(null);
    }
  }, [isAuthenticated, pendingNotification]);

  useEffect(() => {
    const handleNotificationOpen = (remoteMessage: any) => {
      if (remoteMessage?.data?.type === 'session_highlights_ready') {
        setPendingNotification(remoteMessage);
      }
    };

    const unsubscribe = messaging().onNotificationOpenedApp(remoteMessage => {
      handleNotificationOpen(remoteMessage);
    });

    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          handleNotificationOpen(remoteMessage);
        }
      });

    return unsubscribe;
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      setLoading(true);
      const refreshToken = await storage.getRefreshToken();
      if (refreshToken) {
        await authService.logout({ refresh_token: refreshToken });
      } else {
        await storage.clearAll();
      }
    } catch (error) {
      console.error('Logout error:', error);
      await storage.clearAll();
    } finally {
      await socialSignOut();
      setLoading(false);
      setIsAuthenticated(false);
      resetRegistration();
      setProfileSummary(null);
      setUserRole(undefined);
      setMode('player');
      setCoachCode(undefined);
      setAcademyId(undefined);
      setCricId(undefined);
      setSessionId(null);
      setSessionName('');
      setSessionTag('');
      setFinalTimer(0);
      setRegistrationStep(0);
      setReelDeliveries([]);
      setReelInitialIndex(0);
      setReelCurrentPage(1);
      setReelTotalPages(0);
      setSessionMode('solo');
      setSessionPlayMode('batting');
      setSessionUsers([]);
      homeMounted.current = false;
      homeNavIndexRef.current = 0;
      setHomeKey(k => k + 1);
      setRootScreen('signin');
    }
  }, [resetRegistration, setIsAuthenticated]);

  const handleDeleteAccount = useCallback(async () => {
    try {
      setLoading(true);
      await authService.deleteAccount();
    } catch (error) {
      console.error('Delete account error:', error);
      await storage.clearAll();
    } finally {
      await socialSignOut();
      setLoading(false);
      setIsAuthenticated(false);
      resetRegistration();
      setProfileSummary(null);
      setUserRole(undefined);
      setMode('player');
      setCoachCode(undefined);
      setAcademyId(undefined);
      setCricId(undefined);
      setSessionId(null);
      setSessionName('');
      setSessionTag('');
      setFinalTimer(0);
      setRegistrationStep(0);
      setReelDeliveries([]);
      setReelInitialIndex(0);
      setReelCurrentPage(1);
      setReelTotalPages(0);
      setSessionMode('solo');
      setSessionPlayMode('batting');
      setSessionUsers([]);
      homeMounted.current = false;
      homeNavIndexRef.current = 0;
      setHomeKey(k => k + 1);
      setRootScreen('signin');
    }
  }, [resetRegistration, setIsAuthenticated]);

  const BACK_MAP: Partial<Record<RootScreen, RootScreen>> = {
    reset_email: 'signin',
    social_role: 'signin',
    // registration intentionally omitted — RegistrationFlow handles step-back internally
    highlight_playback: 'dashboard',
    highlight_reel: 'highlight_playback',
    session_selection: 'dashboard',
    session_details: 'dashboard',
    session_summary: 'dashboard',
    // camera intentionally omitted — phone back blocked during recording
    profile_details: 'dashboard',
    personal_profile: 'profile_details',
    face_recognition: 'profile_details',
    app_permissions: 'profile_details',
    cricket_profile: 'profile_details',
    playing_style: 'profile_details',
    help_support: 'dashboard',
    notifications: 'dashboard',
    custom_sessions: 'dashboard',
  };

  const lastBackPressed = React.useRef<number>(0);
  const homeNavIndexRef = React.useRef<number>(0);
  const homeMounted = React.useRef(false);
  if (rootScreen === 'dashboard') homeMounted.current = true;
  const [homeKey, setHomeKey] = useState(0);

  useEffect(() => {
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      const prev = BACK_MAP[rootScreen];
      if (prev) {
        if (rootScreen === 'highlight_playback') {
          homeNavIndexRef.current = 1;
        }
        setRootScreen(prev);
        return true;
      }

      // Screens that manage their own back/exit internally — don't interfere
      if (rootScreen === 'registration') {
        return false;
      }

      // Screens where back would exit the app — require double-back
      if (Platform.OS === 'android') {
        const now = Date.now();
        if (now - lastBackPressed.current < 2000) {
          return false; // exit app
        }
        lastBackPressed.current = now;
        ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT);
        return true; // block first press
      }

      return false;
    });
    return () => handler.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rootScreen]);

  const fetchProfileSummary = useCallback(async () => {
    try {
      setSummaryLoading(true);
      const summary = await onboardingService.getSummary();
      setProfileSummary(summary);
      await storage.saveCachedSummary(summary);
    } catch (error) {
      console.error('Failed to fetch profile summary:', error);
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  const mapOnboardingStepToStepIndex = (
    step: OnboardingStep | null,
  ): number => {
    switch (step) {
      case 'personal_profile':
        return 2;
      case 'face_recognition':
        return 3;
      default:
        return 2;
    }
  };

  const shouldGateForPolicy = useCallback(async (): Promise<boolean> => {
    try {
      const status = await policyService.getStatus();
      return status.requires_policy_update === true;
    } catch (error) {
      console.error('Failed to get policy status:', error);
      return false;
    }
  }, []);

  const openPolicyGate = useCallback((target: RootScreen) => {
    setPolicyGateTarget(target);
    setShowPolicySheet(true);
  }, []);

  const completePolicyGate = useCallback(async () => {
    try {
      setAcceptingPolicy(true);
      await policyService.accept();
      setShowPolicySheet(false);

      if (rootScreen === 'splash' && (!isSplashDone || isAuthChecking)) {
        setPendingScreen(policyGateTarget);
      } else {
        setRootScreen(policyGateTarget);
      }
    } catch (error) {
      console.error('Failed to accept policy:', error);
      Alert.alert(
        'Error',
        'We could not save your acceptance. Please try again.',
      );
    } finally {
      setAcceptingPolicy(false);
    }
  }, [isAuthChecking, isSplashDone, policyGateTarget, rootScreen]);

  const handleAuthNavigation = useCallback(
    async (isInitialCheck: boolean = false) => {
      try {
        const status = await onboardingService.getStatus();
        await storage.saveCachedStatus(status);
        const nextScreen: RootScreen = status.onboarding_completed
          ? 'dashboard'
          : 'registration';

        if (!status.onboarding_completed) {
          setRegistrationStep(
            mapOnboardingStepToStepIndex(status.current_step),
          );
          try {
            const summary = await onboardingService.getSummary();
            updateRegistrationFields({
              name: summary.personalProfile?.name ?? '',
              dob: summary.personalProfile?.dob ?? '',
              academyName: summary.academyDetails?.academy_name ?? '',
              academyCode: summary.academyDetails?.coach_license_code ?? '',
            });
          } catch {}
        }

        await refreshUserRole();
        setIsAuthenticated(true);

        if (status.onboarding_completed) {
          fetchProfileSummary();
        }

        if (status.onboarding_completed && (await shouldGateForPolicy())) {
          openPolicyGate(nextScreen);
          return;
        }

        if (isInitialCheck) {
          setPendingScreen(nextScreen);
        } else {
          setRootScreen(nextScreen);
        }
      } catch (error) {
        console.error('Failed to get onboarding status:', error);

        // Network failure: trust the last-known status so the user can keep
        // using offline-capable parts of the app (downloaded clips, etc).
        if (isNetworkError(error)) {
          const cached = await storage.getCachedStatus();
          if (cached?.onboarding_completed) {
            await refreshUserRole();
            setIsAuthenticated(true);
            try {
              const cachedSummary = await storage.getCachedSummary();
              if (cachedSummary) {
                setProfileSummary(cachedSummary);
              }
            } catch (err) {
              console.error('Error loading cached summary:', err);
            }
            if (isInitialCheck) {
              setPendingScreen('dashboard');
            } else {
              setRootScreen('dashboard');
            }
            return;
          }
          // No cached status or onboarding not finished — can't enter app offline.
          setIsAuthenticated(false);
          if (isInitialCheck) {
            setPendingScreen('signin');
          } else {
            setRootScreen('signin');
          }
          return;
        }

        if (axios.isAxiosError(error) && error.response?.status === 401) {
          await storage.clearAll();
        }

        setIsAuthenticated(false);
        if (isInitialCheck) {
          setPendingScreen('signin');
        } else {
          setRootScreen('signin');
        }
      }
    },
    [
      updateRegistrationFields,
      setIsAuthenticated,
      fetchProfileSummary,
      refreshUserRole,
      shouldGateForPolicy,
      openPolicyGate,
    ],
  );

  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await storage.getToken();
        if (!token) {
          setPendingScreen('onboarding');
          return;
        }

        try {
          const cachedSummary = await storage.getCachedSummary();
          if (cachedSummary) {
            setProfileSummary(cachedSummary);
          }
        } catch (err) {
          console.error('Error eagerly loading cached summary:', err);
        }

        const online = await getIsConnected();
        if (!online) {
          const cached = await storage.getCachedStatus();
          if (cached?.onboarding_completed) {
            await refreshUserRole();
            setIsAuthenticated(true);
            try {
              const cachedSummary = await storage.getCachedSummary();
              if (cachedSummary) {
                setProfileSummary(cachedSummary);
              }
            } catch (err) {
              console.error('Error loading cached summary:', err);
            }
            setPendingScreen('dashboard');
            return;
          }
          // Offline with no usable cache — best we can do is the signin screen.
          setIsAuthenticated(false);
          setPendingScreen('signin');
          return;
        }

        await handleAuthNavigation(true);
      } catch (err) {
        console.error('Check auth error:', err);
        setPendingScreen('onboarding');
      } finally {
        setIsAuthChecking(false);
      }
    };
    checkAuth();
  }, [handleAuthNavigation, setIsAuthenticated, refreshUserRole]);

  React.useEffect(() => {
    if (
      isConnected &&
      isAuthenticated &&
      !profileSummary &&
      !summaryLoading &&
      rootScreen === 'dashboard'
    ) {
      fetchProfileSummary();
    }
  }, [
    isConnected,
    isAuthenticated,
    profileSummary,
    summaryLoading,
    rootScreen,
    fetchProfileSummary,
  ]);

  React.useEffect(() => {
    if (
      !isAuthChecking &&
      isSplashDone &&
      rootScreen === 'splash' &&
      pendingScreen
    ) {
      setRootScreen(pendingScreen);
    }
  }, [isAuthChecking, isSplashDone, rootScreen, pendingScreen]);

  const socialErrorMessage = (error: unknown, provider: string): string => {
    if (error instanceof UnsupportedRoleError) {
      return error.message;
    }
    if (axios.isAxiosError(error)) {
      const code = error.response?.data?.error?.code;
      if (code === 'missing_email') {
        return "We couldn't get your email from Apple. Please try again and choose to share your email.";
      }
      if (code === 'account_deactivated') {
        return 'Your account has been deactivated.';
      }
    }
    return `${provider} sign-in failed. Please try again.`;
  };

  const handleSocialLogin = useCallback(
    async (provider: SocialProvider) => {
      if (socialInProgress.current) {
        return;
      }
      socialInProgress.current = true;
      const providerName = provider === 'google' ? 'Google' : 'Apple';
      setSocialProvider(providerName);
      try {
        const idToken = await getFirebaseIdToken(provider);

        try {
          await authService.socialLogin({ id_token: idToken });
          await handleAuthNavigation();
        } catch (innerError) {
          if (
            axios.isAxiosError(innerError) &&
            innerError.response?.status === 409 &&
            innerError.response?.data?.error?.code === 'role_required'
          ) {
            setPendingSocialToken(idToken);
            setSocialRole('player');
            setRootScreen('social_role');
            return;
          }
          throw innerError;
        }
      } catch (error) {
        if (error instanceof SocialSignInCancelledError) {
          return;
        }
        Alert.alert('Error', socialErrorMessage(error, providerName));
      } finally {
        socialInProgress.current = false;
      }
    },
    [handleAuthNavigation],
  );

  const submitSocialRole = useCallback(async () => {
    if (!pendingSocialToken) {
      return;
    }
    try {
      setLoading(true);
      await authService.socialLogin({
        id_token: pendingSocialToken,
        role: socialRole,
      });
      setPendingSocialToken(null);
      await handleAuthNavigation();
    } catch (error) {
      if (
        axios.isAxiosError(error) &&
        error.response?.data?.error?.code === 'invalid_token'
      ) {
        setPendingSocialToken(null);
        setRootScreen('signin');
      }
      Alert.alert('Error', socialErrorMessage(error, socialProvider));
    } finally {
      setLoading(false);
    }
  }, [pendingSocialToken, socialRole, socialProvider, handleAuthNavigation]);

  const cancelSocialRole = useCallback(async () => {
    setPendingSocialToken(null);
    await socialSignOut();
    setRootScreen('signin');
  }, []);

  return (
    <>
      {rootScreen === 'splash' && (
        <SplashScreen onFinish={() => setIsSplashDone(true)} />
      )}

      {rootScreen === 'onboarding' && (
        <OnboardingScreen
          onFinish={() => setRootScreen('registration')}
          onSignIn={() => setRootScreen('signin')}
        />
      )}

      {rootScreen === 'signin' && (
        <SignInScreen
          isLoading={loading}
          onContinue={async (email, pwd) => {
            try {
              setLoading(true);
              await authService.login({
                email: email.trim().toLowerCase(),
                password: pwd,
              });
              await handleAuthNavigation();
            } catch (error) {
              let message = 'Login failed. Please check your credentials.';
              if (error instanceof UnsupportedRoleError) {
                message = error.message;
              } else if (axios.isAxiosError(error)) {
                const detail = error.response?.data?.detail;
                if (typeof detail === 'string') message = detail;
                else if (Array.isArray(detail)) message = detail[0].msg;
                else if (error.response?.status === 401)
                  message = 'Invalid email or password.';
              }
              Alert.alert('Error', message);
            } finally {
              setLoading(false);
            }
          }}
          onGoogle={() => handleSocialLogin('google')}
          onApple={() => handleSocialLogin('apple')}
          showApple={Platform.OS === 'ios'}
          onSignUp={() => {
            setRegistrationStep(0);
            setRootScreen('registration');
          }}
          onForgotPassword={() => setRootScreen('reset_email')}
        />
      )}

      {rootScreen === 'social_role' && (
        <SelectRole
          role={socialRole}
          onUpdateRole={setSocialRole}
          onNext={submitSocialRole}
          onBack={cancelSocialRole}
          isLoading={loading}
          buttonLabel="CONTINUE"
        />
      )}

      {rootScreen === 'registration' && (
        <RegistrationFlow
          onComplete={async () => {
            await refreshUserRole();
            setIsAuthenticated(true);
            fetchProfileSummary();
            setRootScreen('dashboard');
          }}
          onSignIn={() => setRootScreen('signin')}
          onGoogle={() => handleSocialLogin('google')}
          onApple={() => handleSocialLogin('apple')}
          initialStep={registrationStep}
        />
      )}

      {rootScreen === 'reset_email' && (
        <ResetEmailScreen
          onBack={() => setRootScreen('signin')}
          onDone={() => setRootScreen('signin')}
        />
      )}

      {homeMounted.current && rootScreen !== 'camera' && (
        <PlanProvider>
          <View
            key={homeKey}
            style={rootScreen !== 'dashboard' ? styles.hidden : styles.fill}
          >
            <HomeScreen
              role={userRole}
              coachCode={coachCode}
              academyId={academyId}
              cricId={cricId}
              userName={profileSummary?.personalProfile?.name ?? null}
              profileImageUrl={profileSummary?.profileImageUrl ?? null}
              linkedCoach={profileSummary?.linkedCoach ?? null}
              onRefreshSummary={fetchProfileSummary}
              isLoadingUser={summaryLoading}
              showSkeleton={!homeSkeletonShown}
              onSkeletonDone={() => setHomeSkeletonShown(true)}
              onOpenRecord={() => setRootScreen('session_details')}
              onOpenProfile={() => setRootScreen('profile_details')}
              onSettingsOptionPress={async (id: string) => {
                if (id === 'logout') {
                  await handleLogout();
                } else if (id === 'delete_account') {
                  await handleDeleteAccount();
                } else if (id === 'help_support') {
                  setRootScreen('help_support');
                } else if (id === 'notifications') {
                  setRootScreen('notifications');
                } else if (id === 'custom_sessions') {
                  setRootScreen('custom_sessions');
                }
              }}
              isLoadingSettings={loading}
              onOpenHighlight={(
                id: string,
                name: string,
                date: number,
                tag: string,
                num: number,
                highlightSessionMode: string,
                highlightSessionType: string,
              ) => {
                setSessionId(id);
                setSessionName(name);
                setSessionDate(date);
                setSessionTag(tag);
                setSessionNumber(num);
                setHighlightMode(highlightSessionMode);
                setSessionMode(
                  highlightSessionType === 'group' ? 'group' : 'solo',
                );
                setRootScreen('highlight_playback');
              }}
              isActive={rootScreen === 'dashboard'}
              initialNavIndex={homeNavIndexRef.current}
              onNavIndexChange={idx => {
                homeNavIndexRef.current = idx;
              }}
              mode={mode}
              onSwitchMode={setMode}
            />
          </View>
        </PlanProvider>
      )}

      {rootScreen === 'highlight_playback' && (
        <HighlightPlaybackScreen
          sessionId={sessionId || ''}
          sessionName={sessionName}
          sessionDate={sessionDate}
          sessionTag={sessionTag}
          sessionPlayMode={highlightMode}
          sessionMode={mode}
          onBack={() => {
            homeNavIndexRef.current = 1;
            setRootScreen('dashboard');
          }}
          onFullscreen={(
            deliveries,
            index,
            currentPage,
            totalPages,
            players,
          ) => {
            setReelDeliveries(deliveries);
            setReelInitialIndex(index);
            setReelCurrentPage(currentPage);
            setReelTotalPages(totalPages);
            setReelPlayers(players);
            setRootScreen('highlight_reel');
          }}
        />
      )}

      {rootScreen === 'highlight_reel' && (
        <PlanProvider>
          <HighlightReelScreen
            initialDeliveries={reelDeliveries}
            initialIndex={reelInitialIndex}
            sessionId={sessionId || ''}
            sessionNumber={sessionNumber}
            sessionName={sessionName}
            sessionDate={sessionDate}
            initialPage={reelCurrentPage}
            totalPages={reelTotalPages}
            sessionMode={mode}
            sessionType={sessionMode}
            players={reelPlayers}
            onBack={() => setRootScreen('highlight_playback')}
          />
        </PlanProvider>
      )}

      {rootScreen === 'session_selection' && (
        <CreateSessionScreen
          onBack={() => setRootScreen('dashboard')}
          onCreateNew={() => setRootScreen('session_details')}
          onSelectSession={(id: string, pitchLength: number) => {
            setSessionId(id);
            setSessionPitchLength(pitchLength);
            setRootScreen('camera');
          }}
        />
      )}

      {rootScreen === 'session_details' && (
        <CreateNewSessionScreen
          onBack={() => setRootScreen('dashboard')}
          // Coach mode only ever records group sessions.
          forceGroup={isCoachRole(userRole) && mode === 'coach'}
          academyId={academyId}
          sessionMode={mode}
          onConfirm={(
            response: CreateSessionResponse,
            selectedPlayerCricIds: string[],
          ) => {
            setSessionId(response.sessionId);
            const isGroup = response.sessionType === 'group';
            setSessionMode(isGroup ? 'group' : 'solo');
            setSessionPlayMode(
              response.mode === 'bowling' ? 'bowling' : 'batting',
            );
            // The config `users` array is always cric ids. The logged-in user
            // is included only when they participate as a player — i.e. anyone
            // except a coach operating in coach mode (who records others only).
            if (isGroup) {
              const cricIds = [...selectedPlayerCricIds];
              const actsAsPlayer = !(isCoachRole(userRole) && mode === 'coach');
              if (actsAsPlayer && cricId) cricIds.push(cricId);
              setSessionUsers(Array.from(new Set(cricIds)));
            } else {
              setSessionUsers([]);
            }
            setSessionPitchLength(response.pitchLength);
            setRootScreen('camera');
          }}
        />
      )}

      {rootScreen === 'camera' && (
        <CameraScreen
          sessionId={sessionId || ''}
          mode={sessionMode}
          playMode={sessionPlayMode}
          users={sessionUsers}
          pitchLength={sessionPitchLength}
          userType={isCoachRole(userRole) ? mode : undefined}
          onClose={() => setRootScreen('dashboard')}
          onFinish={time => {
            setFinalTimer(time);
            setRootScreen('session_summary');
          }}
        />
      )}

      {rootScreen === 'session_summary' && (
        <SessionSummaryScreen
          sessionId={sessionId || ''}
          duration={finalTimer}
          onDone={() => setRootScreen('dashboard')}
          onClose={() => setRootScreen('dashboard')}
        />
      )}

      {rootScreen === 'profile_details' && (
        <ProfileDetailsScreen
          onBack={() => setRootScreen('dashboard')}
          summary={profileSummary}
          isLoading={summaryLoading}
          onRefresh={fetchProfileSummary}
          onOptionPress={(id: string) => {
            if (id === 'personal_profile') setRootScreen('personal_profile');
            if (id === 'face_recognition') setRootScreen('face_recognition');
            if (id === 'app_permissions') setRootScreen('app_permissions');
            if (id === 'cricket_profile') setRootScreen('cricket_profile');
            if (id === 'playing_style') setRootScreen('playing_style');
          }}
        />
      )}

      {rootScreen === 'personal_profile' && (
        <PersonalProfileScreen
          initialData={profileSummary?.personalProfile ?? undefined}
          onBack={() => setRootScreen('profile_details')}
          onSave={() => {
            fetchProfileSummary();
            setRootScreen('profile_details');
          }}
        />
      )}

      {rootScreen === 'face_recognition' && (
        <FaceRecognitionScreen
          onBack={() => setRootScreen('profile_details')}
          onSave={() => {
            fetchProfileSummary();
            setRootScreen('profile_details');
          }}
          initialImages={{
            left: profileSummary?.faceImageSideview1,
            front: profileSummary?.faceImageFrontview,
            right: profileSummary?.faceImageSideview2,
          }}
        />
      )}

      {rootScreen === 'app_permissions' && (
        <AppPermissionsScreen onBack={() => setRootScreen('profile_details')} />
      )}

      {rootScreen === 'cricket_profile' && (
        <CricketProfileScreen
          initialData={profileSummary?.cricketProfile ?? undefined}
          onBack={() => setRootScreen('profile_details')}
          onSave={() => {
            fetchProfileSummary();
            setRootScreen('profile_details');
          }}
        />
      )}

      {rootScreen === 'playing_style' && (
        <PlayingStyleScreen
          initialData={profileSummary?.cricketProfile ?? undefined}
          onBack={() => setRootScreen('profile_details')}
          onSave={() => {
            fetchProfileSummary();
            setRootScreen('profile_details');
          }}
        />
      )}

      {rootScreen === 'help_support' && (
        <HelpSupportScreen onBack={() => setRootScreen('dashboard')} />
      )}

      {rootScreen === 'notifications' && (
        <NotificationsScreen
          onBack={() => setRootScreen('dashboard')}
          onOpenSessionHighlights={(id, num) => {
            setSessionId(id);
            setSessionName(`Session #${num || ''}`);
            setSessionDate(Date.now());
            setSessionTag('Highlights');
            setHighlightMode('batting');
            setRootScreen('highlight_playback');
          }}
        />
      )}

      {rootScreen === 'custom_sessions' && (
        <CustomSessionsScreen onBack={() => setRootScreen('dashboard')} />
      )}

      <PolicyConsentSheet
        isVisible={showPolicySheet}
        isLoading={acceptingPolicy}
        onAccept={completePolicyGate}
      />
    </>
  );
};

const styles = StyleSheet.create({
  fill: { flex: 1 },
  hidden: { display: 'none' },
});
