import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  Alert,
  Clipboard,
  Share,
  ToastAndroid,
  Platform,
  useWindowDimensions,
  Linking,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { FavoriteClip } from '../../types/favorites';
import { favClipKey } from '../FavoritesScreen';
import { sessionService } from '../../services/session.service';
import {
  removeFavoritesByIds,
  markFavoritesRemoved,
  loadFavoritesPaginated,
} from '../../store/favoritesStore';
import Animated, {
  useSharedValue,
  withTiming,
  withRepeat,
  Easing,
  FadeInDown,
} from 'react-native-reanimated';
import { useHeaderAnimation } from '../../hooks/useHeaderAnimation';
import { useNotifications } from '../../hooks/useNotifications';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { ASSETS } from '../../constants/assets';
import {
  SkeletonBox,
  SHIMMER_BAND_WIDTH,
} from '../../components/common/Skeleton';
import { SegmentedControl } from '../../components/common/SegmentedControl';
import { StatCircle, STAT_RING_COLORS } from '../../components/common/Cards';
import { StatBox } from '../../components/common/StatBox';
import {
  GlassCornerBorder,
  GlassSegmentBorder,
} from '../../components/common/GlassSegmentBorder';
import { TabNavigator, TabItem } from '../../components/common/TabNavigator';
import { Dropdown } from '../../components/common/Dropdown';
import { SessionFilterPicker } from '../../components/common/SessionFilterPicker';
import { VizDetailModal, VizCard } from '../../components/stats/VizDetailModal';
import { VizImage, VizDot } from '../../components/stats/VizImage';
import { VIEWPORTS } from '../../components/stats/viewports';
import { SpeedDistributionChart } from '../../components/stats/SpeedDistributionChart';
import { HighlightsScreen } from '../Highlights/HighlightsScreen';
import { FavoritesScreen } from '../FavoritesScreen';
import { ProfileScreen } from '../Profile/ProfileScreen';
import { OfflinePlaceholder } from '../../components/common/OfflinePlaceholder';
import { PaginationDots } from '../../components/common/PaginationDots';
import {
  PresentationChartIcon,
  MonitorPlayIcon,
  HeartIcon,
  GearSixIcon,
  UserCircleIcon,
  PlusIcon,
  SquareIcon,
  CheckSquareIcon,
  MinusSquareIcon,
  TrashIcon,
  HouseIcon,
  LinkSimpleIcon,
} from 'phosphor-react-native';
import { CoachHome } from '../CoachHome';
import { CoachCodeModal } from '../CoachHome/modals/CoachCodeModal';
import { UserRole, AppMode, isCoachRole } from '../../types/auth';
import { LinkedCoach } from '../../types/onboarding';
import { usePlan } from '../../hooks/usePlan';
import { usePremiumGate } from '../../hooks/usePremiumGate';
import { playerService } from '../../services/player.service';
import {
  dashboardService,
  DashboardResponse,
  DashboardMode,
  DashboardLengthCounts,
  VizPoint,
  SpeedBuckets,
  BallLengthFilter,
  HitFilter,
  getEffectiveLengthFilter,
  toggleLengthFilterValue,
} from '../../services/dashboard.service';
import { colors } from '../../theme/colors';
import { styles } from './styles';

const SESSION_FILTER_MAP: Record<string, number> = {
  'Last Session': 1,
  'Last 2 Sessions': 2,
  'Last 3 Sessions': 3,
  'Last 5 Sessions': 5,
  'Last 10 Sessions': 10,
  'Last 15 Sessions': 15,
  'Last 20 Sessions': 20,
  'Last 25 Sessions': 25,
};

const SESSION_FILTER_OPTIONS = [
  'Last Session',
  'Last 2 Sessions',
  'Last 3 Sessions',
  'Last 5 Sessions',
  'Last 10 Sessions',
  'Last 15 Sessions',
  'Last 20 Sessions',
  'Last 25 Sessions',
  'All Sessions',
];

const ALL_HITS: HitFilter[] = ['played', 'missed', 'left', 'bowled'];

const frac = (value: number, total: number): number =>
  total > 0 ? value / total : 0;

const formatMinutes = (mins: number): string => {
  if (!mins || mins <= 0) return '0m';
  const total = Math.floor(mins);
  const h = Math.floor(total / 60);
  const m = total % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

const buildNavTabs = (mode: AppMode): TabItem[] => [
  mode === 'coach'
    ? {
        id: 'home',
        label: 'Home',
        icon: isActive => (
          <HouseIcon
            size={32}
            color={isActive ? colors.neutrals.white : colors.neutrals[40]}
            weight={isActive ? 'fill' : 'regular'}
          />
        ),
      }
    : {
        id: 'stats',
        label: 'Stats',
        icon: isActive => (
          <PresentationChartIcon
            size={32}
            color={isActive ? colors.neutrals.white : colors.neutrals[40]}
          />
        ),
      },
  {
    id: 'highlights',
    label: 'Highlights',
    icon: isActive => (
      <MonitorPlayIcon
        size={32}
        color={isActive ? colors.neutrals.white : colors.neutrals[40]}
      />
    ),
  },
  {
    id: 'favourites',
    label: 'Favourites',
    icon: isActive => (
      <HeartIcon
        size={32}
        color={isActive ? colors.neutrals.white : colors.neutrals[40]}
      />
    ),
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: isActive => (
      <GearSixIcon
        size={32}
        color={isActive ? colors.neutrals.white : colors.neutrals[40]}
      />
    ),
  },
];

const getLockedVizTitle = (title: string): string => {
  const lowerTitle = title.toLowerCase();
  return title === 'Release Points'
    ? 'Your release points are ready'
    : `Your ${lowerTitle} is ready`;
};

interface HomeScreenProps {
  userName?: string | null;
  profileImageUrl?: string | null;
  isLoadingUser?: boolean;
  showSkeleton?: boolean;
  onSkeletonDone?: () => void;
  onOpenRecord?: () => void;
  onOpenProfile?: () => void;
  onOpenHighlight?: (
    id: string,
    name: string,
    date: number,
    tag: string,
    sessionNumber: number,
    mode: string,
    sessionType: string,
  ) => void;
  initialNavIndex?: number;
  onInitialNavIndexConsumed?: () => void;
  onNavIndexChange?: (index: number) => void;
  isActive?: boolean;
  role?: UserRole;
  coachCode?: string;
  academyId?: string;
  cricId?: string;
  onSettingsOptionPress?: (id: string) => void | Promise<void>;
  isLoadingSettings?: boolean;
  linkedCoach?: LinkedCoach | null;
  onRefreshSummary?: () => Promise<void>;
  mode: AppMode;
  onSwitchMode: (mode: AppMode) => void;
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const getFirstName = (name?: string | null): string => {
  const firstName = name?.trim().split(/\s+/)[0];
  return capitalize(firstName || 'there');
};

export const HomeScreen: React.FC<HomeScreenProps> = ({
  userName,
  profileImageUrl,
  isLoadingUser,
  showSkeleton = false,
  onSkeletonDone,
  onOpenRecord,
  onOpenProfile,
  onOpenHighlight,
  initialNavIndex = 0,
  onInitialNavIndexConsumed,
  onNavIndexChange,
  role,
  coachCode,
  academyId,
  cricId,
  onSettingsOptionPress,
  isLoadingSettings = false,
  linkedCoach,
  onRefreshSummary,
  mode,
  onSwitchMode,
  isActive = true,
}) => {
  useNotifications();
  const { isConnected } = useNetworkStatus();
  const [connectivityBanner, setConnectivityBanner] = useState<
    'offline' | 'reconnected' | null
  >(null);
  const wasOfflineRef = useRef(false);

  useEffect(() => {
    if (!isConnected) {
      wasOfflineRef.current = true;
      setConnectivityBanner('offline');
      return;
    }
    if (wasOfflineRef.current) {
      wasOfflineRef.current = false;
      setConnectivityBanner('reconnected');
      const timer = setTimeout(() => setConnectivityBanner(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [isConnected]);

  const navTabs = React.useMemo(() => buildNavTabs(mode), [mode]);
  const [sessionIndex, setSessionIndex] = useState(0);
  const [navIndex, setNavIndex] = useState(initialNavIndex);
  const [vizPageIndex, setVizPageIndex] = useState(0);
  const [vizPageWidth, setVizPageWidth] = useState(0);
  const [vizDetailOpen, setVizDetailOpen] = useState(false);
  const [vizDetailIndex, setVizDetailIndex] = useState(0);
  const vizScrollRef = useRef<ScrollView>(null);
  const vizPageIndexRef = useRef(0);
  vizPageIndexRef.current = vizPageIndex;
  const wasFetchingVizRef = useRef(false);
  const [vizDots, setVizDots] = useState<Record<string, VizDot[]>>({
    pitch_map: [],
    beehive: [],
    release_points: [],
  });
  const [speedBuckets, setSpeedBuckets] = useState<SpeedBuckets | null>(null);
  const [favSelectionMode, setFavSelectionMode] = useState(false);
  const [favSelectedKeys, setFavSelectedKeys] = useState<Set<string>>(
    new Set(),
  );
  const [favClips, setFavClips] = useState<FavoriteClip[]>([]);
  const [favPage, setFavPage] = useState(1);
  const [favTotalPages, setFavTotalPages] = useState(0);
  const [isLoadingFav, setIsLoadingFav] = useState(true);
  const [isLoadingMoreFav, setIsLoadingMoreFav] = useState(false);
  const [prevNavIndexForFav, setPrevNavIndexForFav] = useState(navIndex);
  if (navIndex !== prevNavIndexForFav) {
    setPrevNavIndexForFav(navIndex);
    if (navIndex === 2) setIsLoadingFav(true);
  }
  const isFetchingFavRef = useRef(false);
  const [isCreatingHighlight, setIsCreatingHighlight] = useState(false);
  const { bottom: bottomInset } = useSafeAreaInsets();

  const favAllKeys = useMemo(() => favClips.map(favClipKey), [favClips]);

  const isAllFavSelected =
    favAllKeys.length > 0 && favAllKeys.every(k => favSelectedKeys.has(k));

  const handleFavLongPress = React.useCallback((key: string) => {
    setFavSelectionMode(true);
    setFavSelectedKeys(new Set([key]));
  }, []);

  const handleFavPress = React.useCallback(
    (key: string) => {
      if (!favSelectionMode) return;
      setFavSelectedKeys(prev => {
        const next = new Set(prev);
        if (next.has(key)) {
          next.delete(key);
        } else {
          next.add(key);
        }
        if (next.size === 0) setFavSelectionMode(false);
        return next;
      });
    },
    [favSelectionMode],
  );

  const handleFavSelectAll = React.useCallback(() => {
    if (isAllFavSelected) {
      setFavSelectionMode(false);
      setFavSelectedKeys(new Set());
    } else {
      setFavSelectionMode(true);
      setFavSelectedKeys(new Set(favAllKeys));
    }
  }, [isAllFavSelected, favAllKeys]);

  const handleFavDeselectAll = React.useCallback(() => {
    setFavSelectionMode(false);
    setFavSelectedKeys(new Set());
  }, []);

  const [isDeleting, setIsDeleting] = useState(false);
  const [coachCodeVisible, setCoachCodeVisible] = useState(false);
  const handleCopyCoachCode = React.useCallback(() => {
    if (!coachCode) return;
    Clipboard.setString(coachCode);
    if (Platform.OS === 'android') {
      ToastAndroid.show('Coach code copied', ToastAndroid.SHORT);
    } else {
      Alert.alert('Copied', 'Coach code copied to clipboard');
    }
  }, [coachCode]);

  const handleShareCoachCode = React.useCallback(async () => {
    if (!coachCode) return;
    try {
      await Share.share({
        message: `Use my coach code ${coachCode} on AthMech to link your account to me.`,
      });
    } catch (err) {
      console.warn('Share coach code failed:', err);
    }
  }, [coachCode]);

  const fetchFavorites = React.useCallback(
    async (pageNum: number = 1, append: boolean = false) => {
      if (isFetchingFavRef.current) return;
      isFetchingFavRef.current = true;
      try {
        if (append) {
          setIsLoadingMoreFav(true);
        } else {
          setIsLoadingFav(true);
        }

        const res = await loadFavoritesPaginated(pageNum, 30, mode);
        if (append) {
          setFavClips(prev => {
            const combined = [...prev, ...res.items];
            const seen = new Set<string>();
            return combined.filter(c => {
              const k = favClipKey(c);
              if (seen.has(k)) return false;
              seen.add(k);
              return true;
            });
          });
        } else {
          setFavClips(res.items);
        }
        setFavPage(res.currentPage);
        setFavTotalPages(res.totalPages);
      } catch (err) {
        console.error('Error fetching favorites:', err);
      } finally {
        setIsLoadingFav(false);
        setIsLoadingMoreFav(false);
        isFetchingFavRef.current = false;
      }
    },
    [mode],
  );

  const handleFavDelete = React.useCallback(async () => {
    const toDelete = favClips.filter(c => favSelectedKeys.has(favClipKey(c)));
    setIsDeleting(true);
    try {
      const ids = toDelete
        .map(c => c.favouriteId)
        .filter((id): id is string => !!id);
      await removeFavoritesByIds(ids);
      markFavoritesRemoved(
        toDelete.map(c => ({
          sessionId: c.sessionId,
          ballNumber: c.ballNumber,
        })),
      );
      await fetchFavorites(1, false);
      setFavSelectionMode(false);
      setFavSelectedKeys(new Set());
    } finally {
      setIsDeleting(false);
    }
  }, [favClips, favSelectedKeys, fetchFavorites]);

  useEffect(() => {
    if (!isActive || navIndex !== 2) return;
    fetchFavorites(1, false);
  }, [isActive, navIndex, fetchFavorites]);

  const { canUseAnalytics, canUseBallTracking } = usePlan();
  const { requireFeature, showUpgradePrompt } = usePremiumGate();
  const canUseCoachMode = isCoachRole(role) && Boolean(academyId);
  const showAnalyticsUpgrade = React.useCallback(() => {
    showUpgradePrompt('analytics');
  }, [showUpgradePrompt]);

  const requireOnline = React.useCallback((): boolean => {
    if (isConnected) return true;
    Alert.alert(
      'No Internet Connection',
      'App will automatically reload once internet is back.',
    );
    return false;
  }, [isConnected]);

  const handleCreateHighlight = React.useCallback(async () => {
    await requireFeature('create_highlights', async () => {
      if (!requireOnline()) return;
      const selected = favClips.filter(c => favSelectedKeys.has(favClipKey(c)));
      if (selected.length === 0) return;
      const clips = selected.map(c => c.configVideoKey).filter(Boolean);
      if (clips.length === 0) {
        Alert.alert('No clips', 'Selected clips have no video keys.');
        return;
      }
      setIsCreatingHighlight(true);
      try {
        await sessionService.generateHighlight(clips);
        setFavSelectionMode(false);
        setFavSelectedKeys(new Set());
        Alert.alert(
          'Processing',
          "Your highlight is being generated. You'll get a notification when it's ready.",
        );
      } catch {
        Alert.alert('Failed', 'Could not create highlight. Please try again.');
      } finally {
        setIsCreatingHighlight(false);
      }
    });
  }, [favClips, favSelectedKeys, requireFeature, requireOnline]);

  const handleNavSelect = React.useCallback(
    (index: number) => {
      setNavIndex(index);
      onNavIndexChange?.(index);
    },
    [onNavIndexChange],
  );
  const [selectedSessionFilter, setSelectedSessionFilter] =
    useState('Last 5 Sessions');
  const [isLoading, setIsLoading] = useState(showSkeleton);
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [isFetchingDashboard, setIsFetchingDashboard] = useState(false);
  const [isFetchingViz, setIsFetchingViz] = useState(false);
  const [baseLoading, setBaseLoading] = useState(true);

  useEffect(() => {
    if (wasFetchingVizRef.current && !isFetchingViz && vizPageWidth) {
      requestAnimationFrame(() => {
        vizScrollRef.current?.scrollTo({
          x: vizPageIndexRef.current * vizPageWidth,
          animated: false,
        });
      });
    }
    wasFetchingVizRef.current = isFetchingViz;
  }, [isFetchingViz, vizPageWidth]);

  const [lengthFilter, setLengthFilter] = useState<BallLengthFilter[]>([]);
  const [hitFilter, setHitFilter] = useState<HitFilter[]>([]);
  // Caches the unfiltered length_counts (only updated when no length filter
  // is active) so KPI chip counts stay consistent while a filter is active.
  const [baseLengthCounts, setBaseLengthCounts] =
    useState<DashboardLengthCounts | null>(null);
  // Send the filter only when it's a non-trivial subset. Empty selection AND
  // "all 4 selected" both mean "no filter" — omit the query param entirely
  // in those cases to keep the request URL clean.
  const effectiveLength = getEffectiveLengthFilter(lengthFilter);
  const effectiveHit: HitFilter[] | undefined =
    hitFilter.length > 0 && hitFilter.length < ALL_HITS.length
      ? hitFilter
      : undefined;

  const toggleLength = React.useCallback((v: BallLengthFilter) => {
    setLengthFilter(prev => toggleLengthFilterValue(prev, v));
  }, []);
  const toggleHit = React.useCallback((v: HitFilter) => {
    setHitFilter(prev => {
      if (prev.length === 0 || prev.length === ALL_HITS.length) return [v];
      return prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v];
    });
  }, []);

  // Segmented control: index 0 = BATTING, 1 = BOWLING.
  const dashboardMode: DashboardMode =
    sessionIndex === 1 ? 'bowling' : 'batting';
  // undefined for "All Sessions" → omit the `sessions` query param entirely.
  const dashboardSessions: number | undefined =
    SESSION_FILTER_MAP[selectedSessionFilter];
  const isFirstNavRender = useRef(true);

  // ─── skeleton shimmer ─────────────────────────────────────────────────────
  const handleLockedCoachMode = async () => {
    Alert.alert(
      'Coach Mode requires academy setup',
      'Coach Mode unlocks after your academy is set up with AthMech. Contact our team to get started.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Contact Team',
          onPress: async () => {
            try {
              await Linking.openURL('https://www.crickroo.com/#contact');
            } catch {
              Alert.alert(
                'Unable to open link',
                'Please visit our website to contact the team.',
              );
            }
          },
        },
      ],
    );
  };

  const { width: screenWidth } = useWindowDimensions();
  const shimmerTx = useSharedValue(-SHIMMER_BAND_WIDTH);

  // ─── header animation ────────────────────────────────────────────────────
  const header = useHeaderAnimation();

  useEffect(() => {
    if (mode === 'coach' && !canUseCoachMode) {
      onSwitchMode('player');
      setNavIndex(0);
    }
  }, [mode, canUseCoachMode, onSwitchMode]);

  // Tell navigator the initialNavIndex was consumed so it resets for next mount
  useEffect(() => {
    onInitialNavIndexConsumed?.();
  }, [onInitialNavIndexConsumed]);

  // Shimmer
  useEffect(() => {
    shimmerTx.value = withRepeat(
      withTiming(screenWidth, { duration: 1200, easing: Easing.linear }),
      -1,
      false,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (mode === 'coach') {
      setIsLoading(false);
      onSkeletonDone?.();
      return;
    }
    if (navIndex !== 0) return;
    if (!isConnected) return;
    if (!canUseAnalytics) {
      setDashboard(null);
      setBaseLengthCounts(null);
      setIsFetchingDashboard(false);
      setBaseLoading(false);
      setIsLoading(false);
      onSkeletonDone?.();
      return;
    }

    let cancelled = false;
    setIsFetchingDashboard(true);
    (async () => {
      try {
        const data = await dashboardService.getDashboard({
          sessions: dashboardSessions,
          mode: dashboardMode,
          length: effectiveLength,
        });
        if (!cancelled) {
          setDashboard(data);
          // Cache the unfiltered length_counts so KPI chip totals stay stable
          // while a length filter is active.
          if (lengthFilter.length === 0) {
            setBaseLengthCounts(data.length_counts);
          }
        }
      } catch (err) {
        console.error('Error fetching dashboard:', err);
      } finally {
        if (!cancelled) {
          setIsFetchingDashboard(false);
          setBaseLoading(false);
          setIsLoading(false);
          onSkeletonDone?.();
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    mode,
    navIndex,
    dashboardMode,
    dashboardSessions,
    isConnected,
    canUseAnalytics,
    lengthFilter,
  ]);

  useEffect(() => {
    if (!canUseAnalytics) {
      setBaseLoading(false);
      return;
    }
    setBaseLoading(true);
  }, [dashboardMode, dashboardSessions, canUseAnalytics]);

  useEffect(() => {
    if (mode === 'coach' || navIndex !== 0 || !isConnected) return;
    if (!canUseBallTracking) {
      setVizDots({
        pitch_map: [],
        beehive: [],
        release_points: [],
      });
      setSpeedBuckets(null);
      setIsFetchingViz(false);
      return;
    }
    let cancelled = false;
    const params = {
      sessions: dashboardSessions,
      mode: dashboardMode,
      length: effectiveLength,
      hit: effectiveHit,
    };
    setIsFetchingViz(true);
    (async () => {
      const [pitchMap, beehive, releasePoints, speed] =
        await Promise.allSettled([
          dashboardService.getPitchMap(params),
          dashboardService.getBeehive(params),
          dashboardService.getReleasePoints(params),
          dashboardService.getSpeedDistribution(params),
        ]);
      if (cancelled) return;
      const extractDots = (
        res: PromiseSettledResult<{
          balls?: { norm: VizPoint; outcome?: string | null }[];
        }>,
      ): VizDot[] => {
        if (res.status !== 'fulfilled') return [];
        return (res.value.balls ?? [])
          .filter(b => b.norm && b.norm.x > 0 && b.norm.x < 1)
          .map(b => ({ norm: b.norm }));
      };
      setVizDots({
        pitch_map: extractDots(pitchMap),
        beehive: extractDots(beehive),
        release_points: extractDots(releasePoints),
      });
      setSpeedBuckets(
        speed.status === 'fulfilled' ? speed.value.buckets : null,
      );
      setIsFetchingViz(false);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    mode,
    navIndex,
    isConnected,
    canUseBallTracking,
    dashboardMode,
    dashboardSessions,
    lengthFilter,
    hitFilter,
  ]);

  const vizCards = useMemo<VizCard[]>(
    () => [
      {
        kind: 'image',
        title: 'Pitch Map',
        image: ASSETS.IMAGES.PITCH,
        dots: vizDots.pitch_map ?? [],
        viewport: VIEWPORTS.pitchMap,
      },
      {
        kind: 'image',
        title: 'Beehive',
        image: ASSETS.IMAGES.BEEHIVE,
        dots: vizDots.beehive ?? [],
        viewport: VIEWPORTS.beehive,
      },
      {
        kind: 'image',
        title: 'Release Points',
        image: ASSETS.IMAGES.RELEASE_POINTS,
        dots: vizDots.release_points ?? [],
        viewport: VIEWPORTS.releasePoints,
      },
      { kind: 'chart', title: 'Speed Distribution', buckets: speedBuckets },
    ],
    [vizDots, speedBuckets],
  );

  const lengthTotal = baseLengthCounts
    ? baseLengthCounts.short +
      baseLengthCounts.good_length +
      baseLengthCounts.full +
      baseLengthCounts.yorker
    : 0;
  const oc = dashboard?.outcome_counts;
  const outcomeTotal = oc ? oc.played + oc.missed + oc.left + oc.bowled : 0;
  const ringsLoading = baseLoading;

  useEffect(() => {
    if (isFirstNavRender.current) {
      isFirstNavRender.current = false;
      return;
    }
    header.triggerAnimation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navIndex]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <LinearGradient
        colors={['#FF6A1A', '#9A3408', '#2A0B03', colors.neutrals.bg]}
        locations={[0, 0.24, 0.52, 0.82]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.homeBackgroundGradient}
        pointerEvents="none"
      />
      <View style={styles.homeBackgroundDim} pointerEvents="none" />
      <LinearGradient
        colors={[
          'rgba(0, 0, 0, 0)',
          'rgba(0, 0, 0, 0)',
          'rgba(0, 0, 0, 0.42)',
        ]}
        locations={[0, 0.42, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.homeBackgroundBottomFade}
        pointerEvents="none"
      />
      {connectivityBanner && (
        <View
          style={[
            styles.connectivityBanner,
            connectivityBanner === 'reconnected' &&
              styles.connectivityBannerOnline,
          ]}
        >
          <Text style={styles.connectivityBannerText}>
            {connectivityBanner === 'offline'
              ? 'No Internet Connection'
              : 'Back Online'}
          </Text>
        </View>
      )}
      {/* ── Header ── */}
      <View style={styles.headerContainer}>
        <Animated.View style={[styles.header, header.headerStyle]}>
          <View style={styles.userInfo}>
            <TouchableOpacity
              onPress={() => requireOnline() && onOpenProfile?.()}
              style={styles.avatarButton}
            >
              {profileImageUrl ? (
                <Image
                  source={{ uri: profileImageUrl }}
                  style={styles.profilePic}
                />
              ) : (
                <UserCircleIcon size={48} color={colors.neutrals[40]} />
              )}
            </TouchableOpacity>
            <View>
              <Text style={styles.greeting}>
                {isLoadingUser ? 'Hi!' : `Hi, ${getFirstName(userName)}!`}
              </Text>
              <Text style={styles.date}>
                {new Date().toLocaleDateString('en-GB', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                })}
              </Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            {navIndex === 2 && favSelectedKeys.size > 0 && (
              <>
                <TouchableOpacity
                  style={styles.calendarButton}
                  onPress={handleFavDeselectAll}
                >
                  <MinusSquareIcon
                    size={24}
                    color={colors.neutrals.white}
                    weight="regular"
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.calendarButton}
                  onPress={handleFavDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <ActivityIndicator
                      size="small"
                      color={colors.primary.main}
                    />
                  ) : (
                    <TrashIcon
                      size={24}
                      color={colors.primary.main}
                      weight="regular"
                    />
                  )}
                </TouchableOpacity>
              </>
            )}
            {navIndex === 2 && favAllKeys.length > 0 && (
              <TouchableOpacity
                style={styles.calendarButton}
                onPress={handleFavSelectAll}
              >
                {isAllFavSelected ? (
                  <CheckSquareIcon
                    size={24}
                    color={colors.primary.main}
                    weight="fill"
                  />
                ) : (
                  <SquareIcon
                    size={24}
                    color={colors.neutrals.white}
                    weight="regular"
                  />
                )}
              </TouchableOpacity>
            )}
            {mode === 'coach' && coachCode && (
              <TouchableOpacity
                style={styles.calendarButton}
                onPress={() => setCoachCodeVisible(true)}
              >
                <LinkSimpleIcon size={22} color={colors.neutrals.white} />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.calendarButton}
              onPress={() => requireOnline() && onOpenRecord?.()}
            >
              <PlusIcon size={24} color={colors.neutrals.white} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>

      <View
        style={[styles.statsTabContainer, navIndex !== 0 && styles.tabHidden]}
      >
        {!isConnected ? (
          <OfflinePlaceholder />
        ) : (
          <View style={styles.statsContent}>
            {mode === 'coach' && canUseCoachMode ? (
              <CoachHome
                role={role}
                academyId={academyId}
                isActive={navIndex === 0}
              />
            ) : isLoading ? (
              <ScrollView
                contentContainerStyle={styles.scrollContent}
                scrollEnabled={false}
              >
                <SkeletonBox
                  shimmerTx={shimmerTx}
                  style={styles.skeletonControl}
                />
                <View style={styles.filterRow}>
                  <SkeletonBox
                    shimmerTx={shimmerTx}
                    style={styles.filterDropdownSkeleton}
                  />
                  <SkeletonBox
                    shimmerTx={shimmerTx}
                    style={styles.filterDropdownSkeleton}
                  />
                </View>
                <View style={[styles.summaryRow, styles.skeletonSummaryRow]}>
                  <SkeletonBox
                    shimmerTx={shimmerTx}
                    style={styles.skeletonStatBoxFirst}
                  />
                  <SkeletonBox
                    shimmerTx={shimmerTx}
                    style={styles.skeletonStatBoxFirst}
                  />
                  <SkeletonBox
                    shimmerTx={shimmerTx}
                    style={styles.skeletonStatBoxLast}
                  />
                </View>
                <SkeletonBox
                  shimmerTx={shimmerTx}
                  style={styles.skeletonCard}
                />
                <SkeletonBox
                  shimmerTx={shimmerTx}
                  style={styles.skeletonCard}
                />
                <SkeletonBox
                  shimmerTx={shimmerTx}
                  style={styles.skeletonSectionTitle}
                />
                <SkeletonBox
                  shimmerTx={shimmerTx}
                  style={styles.skeletonPitchMap}
                />
              </ScrollView>
            ) : (
              <ScrollView contentContainerStyle={styles.scrollContent}>
                <Animated.View entering={FadeInDown.duration(400)}>
                  <SegmentedControl
                    options={['BATTING', 'BOWLING']}
                    selectedIndex={sessionIndex}
                    onChange={i => {
                      setSessionIndex(i);
                      // Mode change clears the ball-type / outcome filters.
                      setLengthFilter([]);
                      setHitFilter([]);
                    }}
                    style={styles.mainToggle}
                    variant="dashboard"
                  />
                  <View style={styles.filterRow}>
                    <SessionFilterPicker
                      options={SESSION_FILTER_OPTIONS}
                      selectedValue={selectedSessionFilter}
                      onSelect={v => {
                        setSelectedSessionFilter(v);
                        setLengthFilter([]);
                        setHitFilter([]);
                      }}
                      dashboardMode={dashboardMode}
                      cricId={cricId}
                      style={styles.filterDropdown}
                    />
                    <Dropdown
                      options={[]}
                      selectedValue="Select Player"
                      onSelect={() => {}}
                      style={styles.filterDropdown}
                    />
                  </View>
                </Animated.View>
                {ringsLoading ? (
                  <SkeletonBox
                    shimmerTx={shimmerTx}
                    style={styles.skeletonCard}
                  />
                ) : (
                  <Animated.View
                    entering={FadeInDown.duration(400)}
                    style={[styles.statsContainer, styles.lengthStatsContainer]}
                  >
                    <GlassCornerBorder />
                    <StatCircle
                      value={baseLengthCounts?.short ?? 0}
                      label="Short Balls"
                      color={STAT_RING_COLORS.purple}
                      progress={frac(baseLengthCounts?.short ?? 0, lengthTotal)}
                      onPress={
                        canUseAnalytics
                          ? () => toggleLength('short')
                          : undefined
                      }
                      locked={!canUseAnalytics}
                      onLockedPress={showAnalyticsUpgrade}
                      dimmed={
                        lengthFilter.length > 0 &&
                        !lengthFilter.includes('short')
                      }
                    />
                    <StatCircle
                      value={baseLengthCounts?.good_length ?? 0}
                      label="Good Length"
                      color={STAT_RING_COLORS.red}
                      progress={frac(
                        baseLengthCounts?.good_length ?? 0,
                        lengthTotal,
                      )}
                      onPress={
                        canUseAnalytics
                          ? () => toggleLength('good_length')
                          : undefined
                      }
                      locked={!canUseAnalytics}
                      onLockedPress={showAnalyticsUpgrade}
                      dimmed={
                        lengthFilter.length > 0 &&
                        !lengthFilter.includes('good_length')
                      }
                    />
                    <StatCircle
                      value={baseLengthCounts?.full ?? 0}
                      label="Full Length"
                      color={STAT_RING_COLORS.green}
                      progress={frac(baseLengthCounts?.full ?? 0, lengthTotal)}
                      onPress={
                        canUseAnalytics ? () => toggleLength('full') : undefined
                      }
                      locked={!canUseAnalytics}
                      onLockedPress={showAnalyticsUpgrade}
                      dimmed={
                        lengthFilter.length > 0 &&
                        !lengthFilter.includes('full')
                      }
                    />
                    <StatCircle
                      value={baseLengthCounts?.yorker ?? 0}
                      label="Yorkers"
                      color={STAT_RING_COLORS.yellow}
                      progress={frac(
                        baseLengthCounts?.yorker ?? 0,
                        lengthTotal,
                      )}
                      onPress={
                        canUseAnalytics
                          ? () => toggleLength('yorker')
                          : undefined
                      }
                      locked={!canUseAnalytics}
                      onLockedPress={showAnalyticsUpgrade}
                      dimmed={
                        lengthFilter.length > 0 &&
                        !lengthFilter.includes('yorker')
                      }
                    />
                  </Animated.View>
                )}

                {isFetchingDashboard ? (
                  <View style={[styles.summaryRow, styles.skeletonSummaryRow]}>
                    <SkeletonBox
                      shimmerTx={shimmerTx}
                      style={styles.skeletonStatBoxFirst}
                    />
                    <SkeletonBox
                      shimmerTx={shimmerTx}
                      style={styles.skeletonStatBoxFirst}
                    />
                    <SkeletonBox
                      shimmerTx={shimmerTx}
                      style={styles.skeletonStatBoxLast}
                    />
                  </View>
                ) : (
                  <Animated.View
                    entering={FadeInDown.duration(400)}
                    style={styles.summaryRow}
                  >
                    <StatBox
                      label="Balls"
                      value={dashboard?.total_balls ?? 0}
                      variant="summary"
                      locked={!canUseAnalytics}
                      onLockedPress={showAnalyticsUpgrade}
                    />
                    <StatBox
                      label="Time"
                      value={formatMinutes(dashboard?.total_time_minutes ?? 0)}
                      variant="summary"
                      locked={!canUseAnalytics}
                      onLockedPress={showAnalyticsUpgrade}
                    />
                    <StatBox
                      label="Matchups"
                      value={0}
                      variant="summary"
                      locked={!canUseAnalytics}
                      onLockedPress={showAnalyticsUpgrade}
                    />
                  </Animated.View>
                )}

                {/* Outcome row — the hit selector. Values track the live,
                  length-filtered response so picking a ball type updates them
                  (with a skeleton). Picking a hit only dims (no dashboard
                  refetch). */}
                {isFetchingDashboard ? (
                  <SkeletonBox
                    shimmerTx={shimmerTx}
                    style={styles.skeletonCard}
                  />
                ) : (
                  <Animated.View
                    entering={FadeInDown.duration(400)}
                    style={[styles.statsContainer, styles.outcomeStatsContainer]}
                  >
                    <GlassSegmentBorder />
                    <StatCircle
                      value={oc?.played ?? 0}
                      label="Played"
                      color={STAT_RING_COLORS.green}
                      progress={frac(oc?.played ?? 0, outcomeTotal)}
                      onPress={
                        canUseAnalytics ? () => toggleHit('played') : undefined
                      }
                      locked={!canUseAnalytics}
                      onLockedPress={showAnalyticsUpgrade}
                      dimmed={
                        hitFilter.length > 0 && !hitFilter.includes('played')
                      }
                    />
                    <StatCircle
                      value={oc?.missed ?? 0}
                      label="Missed"
                      color={STAT_RING_COLORS.red}
                      progress={frac(oc?.missed ?? 0, outcomeTotal)}
                      onPress={
                        canUseAnalytics ? () => toggleHit('missed') : undefined
                      }
                      locked={!canUseAnalytics}
                      onLockedPress={showAnalyticsUpgrade}
                      dimmed={
                        hitFilter.length > 0 && !hitFilter.includes('missed')
                      }
                    />
                    <StatCircle
                      value={oc?.left ?? 0}
                      label="Left"
                      color={STAT_RING_COLORS.purple}
                      progress={frac(oc?.left ?? 0, outcomeTotal)}
                      onPress={
                        canUseAnalytics ? () => toggleHit('left') : undefined
                      }
                      locked={!canUseAnalytics}
                      onLockedPress={showAnalyticsUpgrade}
                      dimmed={
                        hitFilter.length > 0 && !hitFilter.includes('left')
                      }
                    />
                    <StatCircle
                      value={oc?.bowled ?? 0}
                      label="Bowled"
                      color={STAT_RING_COLORS.yellow}
                      progress={frac(oc?.bowled ?? 0, outcomeTotal)}
                      onPress={
                        canUseAnalytics ? () => toggleHit('bowled') : undefined
                      }
                      locked={!canUseAnalytics}
                      onLockedPress={showAnalyticsUpgrade}
                      dimmed={
                        hitFilter.length > 0 && !hitFilter.includes('bowled')
                      }
                    />
                  </Animated.View>
                )}
                <Animated.View
                  entering={FadeInDown.duration(400)}
                  style={styles.pitchSection}
                >
                  {isFetchingViz ? (
                    <View style={styles.vizCard}>
                      <SkeletonBox
                        shimmerTx={shimmerTx}
                        style={styles.skeletonVizTitle}
                      />
                      <SkeletonBox
                        shimmerTx={shimmerTx}
                        style={styles.skeletonVizSquare}
                      />
                    </View>
                  ) : (
                    <>
                      <ScrollView
                        ref={vizScrollRef}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        contentOffset={{
                          x: vizPageIndexRef.current * vizPageWidth,
                          y: 0,
                        }}
                        onLayout={e =>
                          setVizPageWidth(e.nativeEvent.layout.width)
                        }
                        onMomentumScrollEnd={e => {
                          if (!vizPageWidth) return;
                          const page = Math.round(
                            e.nativeEvent.contentOffset.x / vizPageWidth,
                          );
                          setVizPageIndex(page);
                        }}
                      >
                        {vizCards.map((card, cardIndex) => (
                          <TouchableOpacity
                            key={card.title}
                            activeOpacity={0.9}
                            onPress={() => {
                              requireFeature('ball_tracking', () => {
                                setVizDetailIndex(cardIndex);
                                setVizDetailOpen(true);
                              });
                            }}
                            style={[
                              styles.vizCard,
                              { width: vizPageWidth || screenWidth - 64 },
                            ]}
                          >
                            <Text style={styles.sectionTitle}>
                              {card.title}
                            </Text>
                            {card.kind === 'chart' ? (
                              <SpeedDistributionChart
                                buckets={card.buckets}
                                locked={!canUseBallTracking}
                                lockedTitle={getLockedVizTitle(card.title)}
                              />
                            ) : (
                              <VizImage
                                image={card.image}
                                dots={card.dots}
                                viewport={card.viewport}
                                locked={!canUseBallTracking}
                                lockedTitle={getLockedVizTitle(card.title)}
                              />
                            )}
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                      <PaginationDots
                        total={vizCards.length}
                        currentIndex={vizPageIndex}
                        style={styles.vizDots}
                      />
                    </>
                  )}
                </Animated.View>
              </ScrollView>
            )}
          </View>
        )}
      </View>

      {/* Highlights tab */}
      <View
        style={[
          styles.placeholderContainer,
          navIndex !== 1 && styles.tabHidden,
        ]}
      >
        {!isConnected ? (
          <OfflinePlaceholder />
        ) : (
          <HighlightsScreen
            onOpenPlayback={onOpenHighlight}
            onCreateSession={onOpenRecord}
            isActive={navIndex === 1}
            sessionMode={mode}
            academyId={academyId}
          />
        )}
      </View>

      {/* Favourites tab */}
      <View
        style={[styles.statsTabContainer, navIndex !== 2 && styles.tabHidden]}
      >
        <FavoritesScreen
          clips={favClips}
          selectionMode={favSelectionMode}
          selectedKeys={favSelectedKeys}
          onLongPressClip={handleFavLongPress}
          onPressClip={handleFavPress}
          isLoading={isLoadingFav}
          isLoadingMore={isLoadingMoreFav}
          onEndReached={() => {
            if (!isFetchingFavRef.current && favPage < favTotalPages) {
              fetchFavorites(favPage + 1, true);
            }
          }}
        />
      </View>

      {/* Settings tab */}
      <View
        style={[styles.statsTabContainer, navIndex !== 3 && styles.tabHidden]}
      >
        <ProfileScreen
          hideHeader
          hideProfileDetails
          role={role}
          cricId={cricId}
          mode={mode}
          onSwitchMode={nextMode => {
            if (nextMode === 'coach' && !canUseCoachMode) {
              handleLockedCoachMode();
              return;
            }
            onSwitchMode(nextMode);
            setNavIndex(0);
          }}
          linkedCoach={linkedCoach ?? null}
          onLinkCoach={async code => {
            await playerService.linkCoach(code);
            await onRefreshSummary?.();
          }}
          onUnlinkCoach={async () => {
            await playerService.unlinkCoach();
            await onRefreshSummary?.();
          }}
          onOptionPress={id => onSettingsOptionPress?.(id)}
          isLoading={isLoadingSettings}
        />
      </View>

      <TabNavigator
        tabs={navTabs}
        selectedIndex={navIndex}
        onSelect={handleNavSelect}
      />

      {favSelectionMode && favSelectedKeys.size > 0 && (
        <View
          style={[
            styles.downloadButtonContainer,
            { paddingBottom: Math.max(bottomInset, 24) },
          ]}
        >
          <Pressable
            style={styles.downloadButton}
            onPress={handleCreateHighlight}
            disabled={isCreatingHighlight}
          >
            {isCreatingHighlight ? (
              <ActivityIndicator color={colors.neutrals.black} />
            ) : (
              <Text style={styles.downloadButtonText}>CREATE HIGHLIGHT</Text>
            )}
          </Pressable>
        </View>
      )}

      <CoachCodeModal
        isVisible={coachCodeVisible}
        coachCode={coachCode ?? ''}
        onClose={() => setCoachCodeVisible(false)}
        onCopy={handleCopyCoachCode}
        onShare={handleShareCoachCode}
      />

      <VizDetailModal
        visible={vizDetailOpen}
        cards={vizCards}
        initialIndex={vizDetailIndex}
        sessionFilter={selectedSessionFilter}
        sessionFilterOptions={SESSION_FILTER_OPTIONS}
        showPlaceholderDropdown={mode !== 'coach'}
        onSelectSessionFilter={v => {
          setSelectedSessionFilter(v);
          setLengthFilter([]);
          setHitFilter([]);
        }}
        lengthCounts={baseLengthCounts}
        outcomeCounts={dashboard?.outcome_counts}
        lengthFilter={lengthFilter}
        hitFilter={hitFilter}
        onToggleLength={toggleLength}
        onToggleHit={toggleHit}
        ballTypesLoading={ringsLoading}
        graphsLoading={isFetchingViz}
        outcomesLoading={isFetchingDashboard}
        onClose={() => setVizDetailOpen(false)}
      />
    </SafeAreaView>
  );
};
