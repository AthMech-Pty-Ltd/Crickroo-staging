import React, { useMemo, useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedReaction,
  useFrameCallback,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import Svg, { Polyline } from 'react-native-svg';
import BallIcon from '../../../assets/images/ball.svg';
import {
  BallTrajectoryResponse,
  TrajectoryPoint,
} from '../../../types/ballTracking';
import { colors } from '../../../theme/colors';

const LINE_WIDTH = 5;

const PLAYBACK_LEAD_MS = 250;
const BALL_SIZE = LINE_WIDTH;
const TRACKING_START_FRAME_OFFSET = 50;
const MIN_VISIBLE_TRACKING_POINTS = 2;

type ValidTrajectoryPoint = TrajectoryPoint & {
  image_norm: { x: number; y: number };
};

const hasValidImagePoint = (
  point: TrajectoryPoint,
): point is ValidTrajectoryPoint => {
  const x = point.image_norm?.x;
  const y = point.image_norm?.y;
  return (
    point.ball_detected &&
    typeof x === 'number' &&
    typeof y === 'number' &&
    Number.isFinite(x) &&
    Number.isFinite(y) &&
    x >= 0 &&
    x <= 1 &&
    y >= 0 &&
    y <= 1 &&
    Number.isFinite(point.t_ms)
  );
};

interface Props {
  data: BallTrajectoryResponse;
  currentTime: number; // seconds — last value reported by the video player
  isPlaying: boolean; // when true, the dot's clock free-runs on the UI thread
  width: number;
  height: number;
}

function mapNormToScreen(
  nx: number,
  ny: number,
  srcW: number,
  srcH: number,
  dstW: number,
  dstH: number,
) {
  const srcAspect = srcW / srcH;
  const dstAspect = dstW / dstH;
  if (srcAspect > dstAspect) {
    // Source is wider — fit to height, crop horizontally
    const scale = dstH / srcH;
    const scaledWidth = srcW * scale;
    const xOffset = (dstW - scaledWidth) / 2;
    return { x: nx * scaledWidth + xOffset, y: ny * dstH };
  }
  // Source is taller — fit to width, crop vertically
  const scale = dstW / srcW;
  const scaledHeight = srcH * scale;
  const yOffset = (dstH - scaledHeight) / 2;
  return { x: nx * dstW, y: ny * scaledHeight + yOffset };
}

export const BallTrajectoryOverlay: React.FC<Props> = ({
  data,
  currentTime,
  isPlaying,
  width,
  height,
}) => {
  const { trajectory, video, key_frames } = data;
  const clockMs = useSharedValue(currentTime * 1000);
  const videoTimeSec = useSharedValue(currentTime);
  const anchorVideoSec = useSharedValue(currentTime);
  const anchorWallMs = useSharedValue(0);
  const forceAnchor = useSharedValue(true);

  const { trailPoints, trackingPoints } = useMemo(() => {
    const validPoints = trajectory.filter(hasValidImagePoint);
    const firstValidFrame = validPoints[0]?.frame;
    if (firstValidFrame == null) return { trailPoints: [], trackingPoints: [] };

    const startFrame = Math.max(
      key_frames.bounce_frame,
      firstValidFrame + TRACKING_START_FRAME_OFFSET,
    );
    const startIndex = validPoints.findIndex(p => p.frame >= startFrame);
    const fallbackStartIndex = Math.max(
      0,
      Math.min(
        Math.floor(validPoints.length / 2),
        validPoints.length - MIN_VISIBLE_TRACKING_POINTS,
      ),
    );
    const displayPoints = validPoints.slice(
      startIndex >= 0 ? startIndex : fallbackStartIndex,
    );

    const mapPoint = (p: ValidTrajectoryPoint) => {
      const mapped = mapNormToScreen(
        p.image_norm.x,
        p.image_norm.y,
        video.display_w,
        video.display_h,
        width,
        height,
      );
      return { x: mapped.x, y: mapped.y, t_ms: p.t_ms };
    };

    return {
      trailPoints: validPoints.map(mapPoint),
      trackingPoints: displayPoints.map(mapPoint),
    };
  }, [
    trajectory,
    key_frames.bounce_frame,
    video.display_w,
    video.display_h,
    width,
    height,
  ]);

  const lastTms = trackingPoints.length
    ? trackingPoints[trackingPoints.length - 1].t_ms
    : 0;

  const fullTrailStr = useMemo(() => {
    return trailPoints
      .map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`)
      .join(' ');
  }, [trailPoints]);

  const [isTrailVisible, setIsTrailVisible] = useState(false);

  useAnimatedReaction(
    () => {
      'worklet';
      return (
        trackingPoints.length > 0 &&
        clockMs.value >= trackingPoints[0].t_ms
      );
    },
    (cur, prev) => {
      if (cur !== prev) scheduleOnRN(setIsTrailVisible, cur);
    },
    [trackingPoints],
  );

  const frameCallback = useFrameCallback(frame => {
    'worklet';
    // Re-anchor on activation or whenever the player reports a fresh time.
    if (forceAnchor.value || videoTimeSec.value !== anchorVideoSec.value) {
      anchorVideoSec.value = videoTimeSec.value;
      anchorWallMs.value = frame.timeSinceFirstFrame;
      forceAnchor.value = false;
    }
    const est =
      anchorVideoSec.value * 1000 +
      (frame.timeSinceFirstFrame - anchorWallMs.value) +
      PLAYBACK_LEAD_MS;
    clockMs.value = Math.min(est, lastTms);
  }, false);

  useEffect(() => {
    videoTimeSec.value = currentTime;
    if (!isPlaying) clockMs.value = currentTime * 1000;
  }, [currentTime, isPlaying, videoTimeSec, clockMs]);

  useEffect(() => {
    if (isPlaying) {
      forceAnchor.value = true;
      frameCallback.setActive(true);
    } else {
      frameCallback.setActive(false);
    }
  }, [isPlaying, frameCallback, forceAnchor]);

  // ── Dot — positioned on the UI thread, interpolated between detected points ──
  const dotStyle = useAnimatedStyle(() => {
    'worklet';
    const ms = clockMs.value;
    const pts = trackingPoints;
    if (pts.length === 0 || ms < pts[0].t_ms) return { opacity: 0 };

    const last = pts[pts.length - 1];
    let x = last.x;
    let y = last.y;
    if (ms < last.t_ms) {
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i];
        const b = pts[i + 1];
        if (ms >= a.t_ms && ms <= b.t_ms) {
          const span = b.t_ms - a.t_ms;
          const f = span > 0 ? (ms - a.t_ms) / span : 0;
          x = a.x + (b.x - a.x) * f;
          y = a.y + (b.y - a.y) * f;
          break;
        }
      }
    }
    return {
      opacity: 1,
      transform: [
        { translateX: x - BALL_SIZE / 2 },
        { translateY: y - BALL_SIZE / 2 },
      ],
    };
  }, [trackingPoints]);

  return (
    <>
      <Svg
        width={width}
        height={height}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      >
        {isTrailVisible && fullTrailStr.length > 0 && (
          <Polyline
            points={fullTrailStr}
            stroke={colors.primary[40]}
            strokeWidth={LINE_WIDTH}
            fill="none"
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeOpacity={0.8}
          />
        )}
      </Svg>
      <Animated.View style={[styles.dot, dotStyle]} pointerEvents="none">
        <BallIcon width={BALL_SIZE} height={BALL_SIZE} />
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  dot: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: BALL_SIZE,
    height: BALL_SIZE,
  },
});
