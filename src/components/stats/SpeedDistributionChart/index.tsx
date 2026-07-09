import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  Image,
  LayoutChangeEvent,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import LinearGradient from 'react-native-linear-gradient';
import LockImage from '../../../assets/images/lock.svg';
import { ASSETS } from '../../../constants/assets';
import { SpeedBuckets } from '../../../services/dashboard.service';
import { styles } from './styles';

const BARS: { key: keyof SpeedBuckets; label: string }[] = [
  { key: 'under_80', label: '< 80' },
  { key: 'kmph_80_100', label: '80 - 100' },
  { key: 'kmph_100_120', label: '100 - 120' },
  { key: 'kmph_120_140', label: '120 - 140' },
  { key: 'over_140', label: '140+' },
];

/**
 * "Nice number" axis: pick a round tick step (1/2/5 × 10ⁿ) targeting ~6
 * intervals, then round the max up to a multiple of it. Adds one extra step of
 * headroom when the tallest bar reaches the top band so its value label fits.
 */
function buildAxis(maxValue: number): { max: number; ticks: number[] } {
  if (maxValue <= 0) return { max: 10, ticks: [0, 2, 4, 6, 8, 10] };

  const rough = maxValue / 6;
  const mag = Math.pow(10, Math.floor(Math.log10(rough)));
  const norm = rough / mag;
  const unit = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10;
  const step = unit * mag;

  let max = Math.ceil(maxValue / step) * step;
  if (maxValue > max - step) max += step; // headroom for the top value label

  const ticks: number[] = [];
  for (let v = 0; v <= max; v += step) ticks.push(v);
  return { max, ticks };
}

interface SpeedDistributionChartProps {
  buckets?: SpeedBuckets | null;
  style?: StyleProp<ViewStyle>;
  locked?: boolean;
  lockedTitle?: string;
  lockedDescription?: string;
}

export const SpeedDistributionChart: React.FC<SpeedDistributionChartProps> = ({
  buckets,
  style,
  locked = false,
  lockedTitle = 'Your speed distribution is ready',
  lockedDescription = 'See exactly where bowlers are\ntargeting you',
}) => {
  const [plotH, setPlotH] = useState(0);

  const data = useMemo(
    () => BARS.map(b => ({ label: b.label, value: buckets?.[b.key] ?? 0 })),
    [buckets],
  );
  const { max, ticks } = useMemo(
    () => buildAxis(Math.max(0, ...data.map(d => d.value))),
    [data],
  );

  const frac = (v: number) => (max > 0 && plotH > 0 ? (v / max) * plotH : 0);
  const onPlotLayout = (e: LayoutChangeEvent) =>
    setPlotH(e.nativeEvent.layout.height);

  return (
    <View style={[styles.wrapper, style]}>
      <View style={styles.plotRow}>
        <View style={styles.ballsAxis}>
          <Text style={styles.axisTitleVertical}>Balls</Text>
        </View>

        <View style={styles.yAxis}>
          {ticks.map(t => (
            <Text key={t} style={[styles.yLabel, { bottom: frac(t) - 6 }]}>
              {t}
            </Text>
          ))}
        </View>

        <View style={styles.plot} onLayout={onPlotLayout}>
          {ticks.map(t => (
            <View key={t} style={[styles.gridline, { bottom: frac(t) }]} />
          ))}
          <View style={styles.barsRow}>
            {data.map(d => (
              <View key={d.label} style={styles.barCol}>
                <Text style={styles.barValue}>{d.value}</Text>
                <View style={[styles.bar, { height: frac(d.value) }]} />
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.xRow}>
        <View style={styles.xSpacer} />
        {data.map(d => (
          <Text key={d.label} style={styles.xLabel}>
            {d.label}
          </Text>
        ))}
      </View>

      <Text style={styles.xTitle}>Speed (kmph)</Text>
      {locked ? (
        <>
          <BlurView
            pointerEvents="none"
            style={styles.lockedBlur}
            blurType="dark"
            blurAmount={3}
            reducedTransparencyFallbackColor="rgba(13, 13, 12, 0.16)"
          />
          <View pointerEvents="none" style={styles.lockedDim} />
          <View pointerEvents="none" style={styles.lockedContent}>
            <Image
              source={ASSETS.IMAGES.LOGO}
              style={styles.lockedLogo}
              resizeMode="contain"
            />
            <LockImage width={58} height={58} />
            <Text style={styles.lockedTitle}>{lockedTitle}</Text>
            <Text style={styles.lockedDescription}>{lockedDescription}</Text>
            <LinearGradient
              colors={['#EB5F10', '#F4AC25']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.unlockButton}
            >
              <Text style={styles.unlockText}>UNLOCK WITH PRO</Text>
            </LinearGradient>
          </View>
        </>
      ) : null}
    </View>
  );
};
