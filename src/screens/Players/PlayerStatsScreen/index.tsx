import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Modal,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeftIcon } from 'phosphor-react-native';
import Animated, {
  useSharedValue,
  withTiming,
  withRepeat,
  Easing,
  FadeInDown,
} from 'react-native-reanimated';
import { useNetworkStatus } from '../../../hooks/useNetworkStatus';
import { ASSETS } from '../../../constants/assets';
import {
  SkeletonBox,
  SHIMMER_BAND_WIDTH,
} from '../../../components/common/Skeleton';
import { SegmentedControl } from '../../../components/common/SegmentedControl';
import { StatCircle, STAT_RING_COLORS } from '../../../components/common/Cards';
import { StatBox } from '../../../components/common/StatBox';
import {
  GlassCornerBorder,
  GlassSegmentBorder,
} from '../../../components/common/GlassSegmentBorder';
import { SessionFilterPicker } from '../../../components/common/SessionFilterPicker';
import {
  VizDetailModal,
  VizCard,
} from '../../../components/stats/VizDetailModal';
import { VizImage, VizDot } from '../../../components/stats/VizImage';
import { VIEWPORTS } from '../../../components/stats/viewports';
import { SpeedDistributionChart } from '../../../components/stats/SpeedDistributionChart';
import { OfflinePlaceholder } from '../../../components/common/OfflinePlaceholder';
import { PaginationDots } from '../../../components/common/PaginationDots';
import {
  dashboardService,
  DashboardResponse,
  DashboardLengthCounts,
  VizPoint,
  SpeedBuckets,
  BallLengthFilter,
  HitFilter,
  GetDashboardParams,
} from '../../../services/dashboard.service';
import { colors } from '../../../theme/colors';
import { styles } from './styles';
import { usePlan } from '../../../hooks/usePlan';
import { usePremiumGate } from '../../../hooks/usePremiumGate';

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

const ALL_LENGTHS: BallLengthFilter[] = [
  'short',
  'good_length',
  'full',
  'yorker',
];
const ALL_HITS: HitFilter[] = ['played', 'missed', 'left', 'bowled'];

const frac = (value: number, total: number): number =>
  total > 0 ? value / total : 0;

const getLockedVizTitle = (title: string): string => {
  const lowerTitle = title.toLowerCase();
  return title === 'Release Points'
    ? 'Your release points are ready'
    : `Your ${lowerTitle} is ready`;
};

const formatMinutes = (mins: number): string => {
  if (!mins || mins <= 0) return '0m';
  const total = Math.floor(mins);
  const h = Math.floor(total / 60);
  const m = total % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

interface PlayerStatsScreenProps {
  isVisible: boolean;
  cricId: string;
  playerName: string;
  onBack: () => void;
}

export const PlayerStatsScreen: React.FC<PlayerStatsScreenProps> = ({
  isVisible,
  cricId,
  playerName,
  onBack,
}) => {
  const { isConnected } = useNetworkStatus();
  const { width: screenWidth } = useWindowDimensions();
  const { canUseAnalytics, canUseBallTracking } = usePlan();
  const { requireFeature, showUpgradePrompt } = usePremiumGate();
  const showAnalyticsUpgrade = React.useCallback(() => {
    showUpgradePrompt('analytics');
  }, [showUpgradePrompt]);

  // Navigation / Tabs mock states for rendering stats
  const [sessionIndex, setSessionIndex] = useState(0); // 0 = BATTING, 1 = BOWLING
  const [selectedSessionFilter, setSelectedSessionFilter] =
    useState('Last 5 Sessions');
  const [isLoading, setIsLoading] = useState(true);
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [isFetchingDashboard, setIsFetchingDashboard] = useState(false);
  const [isFetchingViz, setIsFetchingViz] = useState(false);
  const [baseLoading, setBaseLoading] = useState(true);

  const [lengthFilter, setLengthFilter] = useState<BallLengthFilter[]>([]);
  const [hitFilter, setHitFilter] = useState<HitFilter[]>([]);
  const [baseLengthCounts, setBaseLengthCounts] =
    useState<DashboardLengthCounts | null>(null);

  const [vizDots, setVizDots] = useState<{
    pitch_map: VizDot[] | null;
    beehive: VizDot[] | null;
    release_points: VizDot[] | null;
  }>({ pitch_map: null, beehive: null, release_points: null });
  const [speedBuckets, setSpeedBuckets] = useState<SpeedBuckets | null>(null);

  const [vizPageIndex, setVizPageIndex] = useState(0);
  const [vizPageWidth, setVizPageWidth] = useState(0);
  const [vizDetailOpen, setVizDetailOpen] = useState(false);
  const [vizDetailIndex, setVizDetailIndex] = useState(0);

  const vizScrollRef = React.useRef<ScrollView>(null);
  const vizPageIndexRef = React.useRef(0);
  vizPageIndexRef.current = vizPageIndex;
  const wasFetchingViz = React.useRef(false);

  useEffect(() => {
    if (wasFetchingViz.current && !isFetchingViz && vizPageWidth) {
      requestAnimationFrame(() => {
        vizScrollRef.current?.scrollTo({
          x: vizPageIndexRef.current * vizPageWidth,
          animated: false,
        });
      });
    }
    wasFetchingViz.current = isFetchingViz;
  }, [isFetchingViz, vizPageWidth]);

  const effectiveLength: BallLengthFilter[] | undefined =
    lengthFilter.length > 0 && lengthFilter.length < ALL_LENGTHS.length
      ? lengthFilter
      : undefined;
  const effectiveHit: HitFilter[] | undefined =
    hitFilter.length > 0 && hitFilter.length < ALL_HITS.length
      ? hitFilter
      : undefined;

  const toggleLength = React.useCallback((v: BallLengthFilter) => {
    setLengthFilter(prev => {
      if (prev.length === 0 || prev.length === ALL_LENGTHS.length) return [v];
      return prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v];
    });
  }, []);

  const toggleHit = React.useCallback((v: HitFilter) => {
    setHitFilter(prev => {
      if (prev.length === 0 || prev.length === ALL_HITS.length) return [v];
      return prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v];
    });
  }, []);

  const dashboardMode = sessionIndex === 1 ? 'bowling' : 'batting';
  const dashboardSessions = SESSION_FILTER_MAP[selectedSessionFilter];

  // Shimmer
  const shimmerTx = useSharedValue(-SHIMMER_BAND_WIDTH);
  useEffect(() => {
    shimmerTx.value = withRepeat(
      withTiming(screenWidth, { duration: 1200, easing: Easing.linear }),
      -1,
      false,
    );
  }, [screenWidth, shimmerTx]);

  // Fetch dashboard
  useEffect(() => {
    if (!isVisible || !cricId || !isConnected) return;
    if (!canUseAnalytics) {
      setDashboard(null);
      setBaseLengthCounts(null);
      setIsFetchingDashboard(false);
      setBaseLoading(false);
      setIsLoading(false);
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
          cric_id: cricId,
        });
        if (!cancelled) {
          setDashboard(data);
          if (lengthFilter.length === 0) {
            setBaseLengthCounts(data.length_counts);
          }
        }
      } catch (err) {
        console.error('Error fetching player dashboard:', err);
      } finally {
        if (!cancelled) {
          setIsFetchingDashboard(false);
          setBaseLoading(false);
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    isVisible,
    cricId,
    canUseAnalytics,
    dashboardMode,
    dashboardSessions,
    isConnected,
    lengthFilter,
    effectiveLength,
  ]);

  // Reset baseLoading on filter change
  useEffect(() => {
    setBaseLoading(true);
  }, [dashboardMode, dashboardSessions]);

  // Fetch visualizations
  useEffect(() => {
    if (!isVisible || !cricId || !isConnected) return;
    if (!canUseBallTracking) {
      setVizDots({
        pitch_map: null,
        beehive: null,
        release_points: null,
      });
      setSpeedBuckets(null);
      setIsFetchingViz(false);
      return;
    }

    let cancelled = false;
    const params: GetDashboardParams = {
      sessions: dashboardSessions,
      mode: dashboardMode,
      length: effectiveLength,
      hit: effectiveHit,
      cric_id: cricId,
    };
    setIsFetchingViz(true);

    (async () => {
      try {
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
      } catch (err) {
        console.error('Error fetching player visualizations:', err);
      } finally {
        if (!cancelled) {
          setIsFetchingViz(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    isVisible,
    cricId,
    isConnected,
    canUseBallTracking,
    dashboardMode,
    dashboardSessions,
    lengthFilter,
    hitFilter,
    effectiveLength,
    effectiveHit,
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

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="fullScreen"
      statusBarTranslucent
      onRequestClose={onBack}
    >
      <SafeAreaProvider>
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
          <LinearGradient
            colors={['#FF6A1A', '#9A3408', '#2A0B03', colors.neutrals.bg]}
            locations={[0, 0.24, 0.52, 0.82]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.backgroundGradient}
            pointerEvents="none"
          />
          <View style={styles.backgroundDim} pointerEvents="none" />
          <LinearGradient
            colors={[
              'rgba(0, 0, 0, 0)',
              'rgba(0, 0, 0, 0)',
              'rgba(0, 0, 0, 0.42)',
            ]}
            locations={[0, 0.42, 1]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.backgroundBottomFade}
            pointerEvents="none"
          />
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
              <ArrowLeftIcon size={22} color={colors.neutrals.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {playerName}
            </Text>
          </View>

          {!isConnected ? (
            <OfflinePlaceholder />
          ) : (
            <View style={styles.statsContent}>
              {isLoading ? (
                <ScrollView
                  contentContainerStyle={styles.scrollContent}
                  scrollEnabled={false}
                >
                  <SkeletonBox
                    shimmerTx={shimmerTx}
                    style={styles.skeletonControl}
                  />
                  <SkeletonBox
                    shimmerTx={shimmerTx}
                    style={styles.skeletonDropdown}
                  />
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
                        setLengthFilter([]);
                        setHitFilter([]);
                      }}
                      style={styles.mainToggle}
                      variant="dashboard"
                    />
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
                      style={styles.filterBar}
                    />
                  </Animated.View>

                  {baseLoading ? (
                    <SkeletonBox
                      shimmerTx={shimmerTx}
                      style={styles.skeletonCard}
                    />
                  ) : (
                    <Animated.View
                      entering={FadeInDown.duration(400)}
                      style={[
                        styles.statsContainer,
                        styles.lengthStatsContainer,
                      ]}
                    >
                      <GlassCornerBorder />
                      <StatCircle
                        value={baseLengthCounts?.short ?? 0}
                        label="Short Balls"
                        color={STAT_RING_COLORS.purple}
                        progress={frac(
                          baseLengthCounts?.short ?? 0,
                          lengthTotal,
                        )}
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
                        progress={frac(
                          baseLengthCounts?.full ?? 0,
                          lengthTotal,
                        )}
                        onPress={
                          canUseAnalytics
                            ? () => toggleLength('full')
                            : undefined
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
                    <View
                      style={[styles.summaryRow, styles.skeletonSummaryRow]}
                    >
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
                        value={formatMinutes(
                          dashboard?.total_time_minutes ?? 0,
                        )}
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

                  {isFetchingDashboard ? (
                    <SkeletonBox
                      shimmerTx={shimmerTx}
                      style={styles.skeletonCard}
                    />
                  ) : (
                    <Animated.View
                      entering={FadeInDown.duration(400)}
                      style={[
                        styles.statsContainer,
                        styles.outcomeStatsContainer,
                      ]}
                    >
                      <GlassSegmentBorder />
                      <StatCircle
                        value={oc?.played ?? 0}
                        label="Played"
                        color={STAT_RING_COLORS.green}
                        progress={frac(oc?.played ?? 0, outcomeTotal)}
                        onPress={
                          canUseAnalytics
                            ? () => toggleHit('played')
                            : undefined
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
                          canUseAnalytics
                            ? () => toggleHit('missed')
                            : undefined
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
                          canUseAnalytics
                            ? () => toggleHit('bowled')
                            : undefined
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

          <VizDetailModal
            visible={vizDetailOpen}
            cards={vizCards}
            initialIndex={vizDetailIndex}
            sessionFilter={selectedSessionFilter}
            sessionFilterOptions={SESSION_FILTER_OPTIONS}
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
            ballTypesLoading={baseLoading}
            graphsLoading={isFetchingViz}
            outcomesLoading={isFetchingDashboard}
            onClose={() => setVizDetailOpen(false)}
          />
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
};
