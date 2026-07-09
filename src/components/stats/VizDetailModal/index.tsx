import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  ImageSourcePropType,
  ScrollView,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
  useWindowDimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import {
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { ArrowLeftIcon } from 'phosphor-react-native';
import { Dropdown } from '../../common/Dropdown';
import { StatCircle, STAT_RING_COLORS } from '../../common/Cards';
import { PaginationDots } from '../../common/PaginationDots';
import { SkeletonBox, SHIMMER_BAND_WIDTH } from '../../common/Skeleton';
import { VizImage, VizDot } from '../VizImage';
import { SpeedDistributionChart } from '../SpeedDistributionChart';
import { Viewport } from '../viewports';
import {
  DashboardLengthCounts,
  DashboardOutcomeCounts,
  SpeedBuckets,
  BallLengthFilter,
  HitFilter,
} from '../../../services/dashboard.service';
import { colors } from '../../../theme/colors';
import { styles } from './styles';

export type VizCard =
  | {
      kind: 'image';
      title: string;
      image: ImageSourcePropType;
      dots?: VizDot[];
      viewport: Viewport;
    }
  | { kind: 'chart'; title: string; buckets?: SpeedBuckets | null };

interface VizDetailModalProps {
  visible: boolean;
  cards: readonly VizCard[];
  initialIndex: number;
  sessionFilter: string;
  sessionFilterOptions: string[];
  onSelectSessionFilter: (value: string) => void;
  lengthCounts?: DashboardLengthCounts | null;
  outcomeCounts?: DashboardOutcomeCounts | null;
  lengthFilter?: BallLengthFilter[];
  hitFilter?: HitFilter[];
  onToggleLength?: (value: BallLengthFilter) => void;
  onToggleHit?: (value: HitFilter) => void;
  ballTypesLoading?: boolean;
  graphsLoading?: boolean;
  outcomesLoading?: boolean;
  onClose: () => void;
  showPlaceholderDropdown?: boolean;
}

export const VizDetailModal: React.FC<VizDetailModalProps> = ({
  visible,
  cards,
  initialIndex,
  sessionFilter,
  sessionFilterOptions,
  onSelectSessionFilter,
  lengthCounts,
  outcomeCounts,
  lengthFilter = [],
  hitFilter = [],
  onToggleLength,
  onToggleHit,
  ballTypesLoading = false,
  graphsLoading = false,
  outcomesLoading = false,
  onClose,
  showPlaceholderDropdown = false,
}) => {
  const { width: screenWidth } = useWindowDimensions();
  const [index, setIndex] = useState(initialIndex);
  const scrollRef = useRef<ScrollView>(null);
  const indexRef = useRef(index);
  indexRef.current = index;
  const wasGraphsLoading = useRef(false);

  const shimmerTx = useSharedValue(-SHIMMER_BAND_WIDTH);
  useEffect(() => {
    shimmerTx.value = withRepeat(
      withTiming(screenWidth, { duration: 1200, easing: Easing.linear }),
      -1,
      false,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!visible) return;
    setIndex(initialIndex);
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        x: initialIndex * screenWidth,
        animated: false,
      });
    });
  }, [visible, initialIndex, screenWidth]);

  useEffect(() => {
    if (visible && wasGraphsLoading.current && !graphsLoading) {
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({
          x: indexRef.current * screenWidth,
          animated: false,
        });
      });
    }
    wasGraphsLoading.current = graphsLoading;
  }, [graphsLoading, visible, screenWidth]);

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(e.nativeEvent.contentOffset.x / screenWidth));
  };

  const currentTitle = cards[index]?.title ?? '';

  // Ring fill = value / group total (matches the dashboard rings).
  const lengthTotal = lengthCounts
    ? lengthCounts.short +
      lengthCounts.good_length +
      lengthCounts.full +
      lengthCounts.yorker
    : 0;
  const outcomeTotal = outcomeCounts
    ? outcomeCounts.played +
      outcomeCounts.missed +
      outcomeCounts.left +
      outcomeCounts.bowled
    : 0;
  const frac = (v: number, total: number) => (total > 0 ? v / total : 0);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <SafeAreaProvider>
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
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
            <TouchableOpacity onPress={onClose} style={styles.backButton}>
              <ArrowLeftIcon size={24} color={colors.neutrals.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{currentTitle}</Text>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            {showPlaceholderDropdown ? (
              <View style={styles.filterRow}>
                <Dropdown
                  options={sessionFilterOptions}
                  selectedValue={sessionFilter}
                  onSelect={onSelectSessionFilter}
                  style={styles.filterDropdown}
                />
                <Dropdown
                  options={[]}
                  selectedValue="Select Player"
                  onSelect={() => {}}
                  style={styles.filterDropdown}
                />
              </View>
            ) : (
              <Dropdown
                options={sessionFilterOptions}
                selectedValue={sessionFilter}
                onSelect={onSelectSessionFilter}
                style={styles.filter}
              />
            )}

            <View style={styles.graphSection}>
              {graphsLoading ? (
                <SkeletonBox
                  shimmerTx={shimmerTx}
                  style={[styles.skeletonGraph, { width: screenWidth - 40 }]}
                />
              ) : (
                <>
                  <ScrollView
                    ref={scrollRef}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    contentOffset={{ x: indexRef.current * screenWidth, y: 0 }}
                    onMomentumScrollEnd={onMomentumEnd}
                  >
                    {cards.map(card => (
                      <View
                        key={card.title}
                        style={[styles.graphPage, { width: screenWidth }]}
                      >
                        {card.kind === 'chart' ? (
                          <SpeedDistributionChart
                            buckets={card.buckets}
                            style={styles.chartPanel}
                          />
                        ) : (
                          <VizImage
                            image={card.image}
                            dots={card.dots}
                            viewport={card.viewport}
                          />
                        )}
                      </View>
                    ))}
                  </ScrollView>
                  <PaginationDots
                    total={cards.length}
                    currentIndex={index}
                    style={styles.dots}
                  />
                </>
              )}
            </View>

            {ballTypesLoading ? (
              <SkeletonBox shimmerTx={shimmerTx} style={styles.skeletonKpi} />
            ) : (
              <View style={styles.kpiRow}>
                <StatCircle
                  value={lengthCounts?.short ?? 0}
                  label="Short Balls"
                  color={STAT_RING_COLORS.purple}
                  progress={frac(lengthCounts?.short ?? 0, lengthTotal)}
                  onPress={() => onToggleLength?.('short')}
                  dimmed={
                    lengthFilter.length > 0 && !lengthFilter.includes('short')
                  }
                />
                <StatCircle
                  value={lengthCounts?.good_length ?? 0}
                  label="Good Length"
                  color={STAT_RING_COLORS.red}
                  progress={frac(lengthCounts?.good_length ?? 0, lengthTotal)}
                  onPress={() => onToggleLength?.('good_length')}
                  dimmed={
                    lengthFilter.length > 0 &&
                    !lengthFilter.includes('good_length')
                  }
                />
                <StatCircle
                  value={lengthCounts?.full ?? 0}
                  label="Full Length"
                  color={STAT_RING_COLORS.green}
                  progress={frac(lengthCounts?.full ?? 0, lengthTotal)}
                  onPress={() => onToggleLength?.('full')}
                  dimmed={
                    lengthFilter.length > 0 && !lengthFilter.includes('full')
                  }
                />
                <StatCircle
                  value={lengthCounts?.yorker ?? 0}
                  label="Yorkers"
                  color={STAT_RING_COLORS.yellow}
                  progress={frac(lengthCounts?.yorker ?? 0, lengthTotal)}
                  onPress={() => onToggleLength?.('yorker')}
                  dimmed={
                    lengthFilter.length > 0 && !lengthFilter.includes('yorker')
                  }
                />
              </View>
            )}

            {outcomesLoading ? (
              <SkeletonBox shimmerTx={shimmerTx} style={styles.skeletonKpi} />
            ) : (
              <View style={styles.kpiRow}>
                <StatCircle
                  value={outcomeCounts?.played ?? 0}
                  label="Played"
                  color={STAT_RING_COLORS.green}
                  progress={frac(outcomeCounts?.played ?? 0, outcomeTotal)}
                  onPress={() => onToggleHit?.('played')}
                  dimmed={hitFilter.length > 0 && !hitFilter.includes('played')}
                />
                <StatCircle
                  value={outcomeCounts?.missed ?? 0}
                  label="Missed"
                  color={STAT_RING_COLORS.red}
                  progress={frac(outcomeCounts?.missed ?? 0, outcomeTotal)}
                  onPress={() => onToggleHit?.('missed')}
                  dimmed={hitFilter.length > 0 && !hitFilter.includes('missed')}
                />
                <StatCircle
                  value={outcomeCounts?.left ?? 0}
                  label="Left"
                  color={STAT_RING_COLORS.purple}
                  progress={frac(outcomeCounts?.left ?? 0, outcomeTotal)}
                  onPress={() => onToggleHit?.('left')}
                  dimmed={hitFilter.length > 0 && !hitFilter.includes('left')}
                />
                <StatCircle
                  value={outcomeCounts?.bowled ?? 0}
                  label="Bowled"
                  color={STAT_RING_COLORS.yellow}
                  progress={frac(outcomeCounts?.bowled ?? 0, outcomeTotal)}
                  onPress={() => onToggleHit?.('bowled')}
                  dimmed={hitFilter.length > 0 && !hitFilter.includes('bowled')}
                />
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
};
