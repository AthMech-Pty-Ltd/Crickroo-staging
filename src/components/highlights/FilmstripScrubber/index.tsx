import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  PanResponder,
  LayoutChangeEvent,
} from 'react-native';
import { styles } from './styles';

const FRAME_RATE = 60;
const FRAME_STEP_SECONDS = 1 / FRAME_RATE;

function snapToFrame(time: number): number {
  return Math.round(time / FRAME_STEP_SECONDS) * FRAME_STEP_SECONDS;
}

interface FilmstripScrubberProps {
  videoUrl: string;
  duration: number;
  currentTime: number;
  isActive: boolean;
  onSeekStart: () => void;
  onSeek: (time: number) => void;
  onSeekEnd: (time: number) => void;
}

function formatTime(secs: number): string {
  const safeSecs = Math.max(0, secs || 0);
  const m = Math.floor(safeSecs / 60);
  const s = Math.floor(safeSecs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export const FilmstripScrubber: React.FC<FilmstripScrubberProps> = ({
  duration,
  currentTime,
  onSeekStart,
  onSeek,
  onSeekEnd,
}) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubTime, setScrubTime] = useState(0);

  const containerWidthRef = useRef(0);
  const durationRef = useRef(duration);
  const currentTimeRef = useRef(currentTime);
  const dragStartTimeRef = useRef(0);
  const onSeekStartRef = useRef(onSeekStart);
  const onSeekRef = useRef(onSeek);
  const onSeekEndRef = useRef(onSeekEnd);

  useEffect(() => {
    durationRef.current = duration;
  }, [duration]);

  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

  useEffect(() => {
    onSeekStartRef.current = onSeekStart;
  }, [onSeekStart]);

  useEffect(() => {
    onSeekRef.current = onSeek;
  }, [onSeek]);

  useEffect(() => {
    onSeekEndRef.current = onSeekEnd;
  }, [onSeekEnd]);

  const frameCount = useMemo(() => {
    if (containerWidth <= 0) return 24;
    return Math.max(18, Math.min(42, Math.floor(containerWidth / 9)));
  }, [containerWidth]);

  const seekFromDrag = (dx: number) => {
    const width = Math.max(1, containerWidthRef.current);
    const timeDelta = (dx / width) * durationRef.current;
    const rawTime = dragStartTimeRef.current + timeDelta;
    return Math.max(0, Math.min(durationRef.current, snapToFrame(rawTime)));
  };

  const nudgeByFrames = (frameDelta: number) => {
    const nextTime = Math.max(
      0,
      Math.min(durationRef.current, snapToFrame(currentTime + frameDelta * FRAME_STEP_SECONDS)),
    );

    setScrubTime(nextTime);
    onSeekStartRef.current();
    onSeekRef.current(nextTime);
    onSeekEndRef.current(nextTime);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        const startTime = currentTimeRef.current;
        dragStartTimeRef.current = startTime;
        setIsScrubbing(true);
        setScrubTime(startTime);
        onSeekStartRef.current();
      },
      onPanResponderMove: (_evt, gestureState) => {
        const t = seekFromDrag(gestureState.dx);
        setScrubTime(t);
        onSeekRef.current(t);
      },
      onPanResponderRelease: (_evt, gestureState) => {
        const t = seekFromDrag(gestureState.dx);
        setScrubTime(t);
        setIsScrubbing(false);
        onSeekEndRef.current(t);
      },
      onPanResponderTerminationRequest: () => false,
      onPanResponderTerminate: (_evt, gestureState) => {
        const t = seekFromDrag(gestureState.dx);
        setScrubTime(t);
        setIsScrubbing(false);
        onSeekEndRef.current(t);
      },
    }),
  ).current;

  const progress = duration > 0 ? Math.max(0, Math.min(1, currentTime / duration)) : 0;
  const playheadX = progress * containerWidth;
  const labelX = Math.max(28, Math.min(containerWidth - 28, playheadX));

  return (
    <View
      style={styles.container}
      onLayout={(e: LayoutChangeEvent) => {
        containerWidthRef.current = e.nativeEvent.layout.width;
        setContainerWidth(e.nativeEvent.layout.width);
      }}
      {...panResponder.panHandlers}
    >
      {isScrubbing && containerWidth > 0 && (
        <View style={[styles.timeLabel, { left: labelX }]} pointerEvents="none">
          <Text style={styles.timeLabelText}>{formatTime(scrubTime)}</Text>
        </View>
      )}

      <View style={styles.scrubberRow}>
        <TouchableOpacity
          style={styles.frameButton}
          activeOpacity={0.75}
          onPress={() => nudgeByFrames(-1)}
        >
          <Text style={styles.frameButtonText}>‹</Text>
        </TouchableOpacity>

        <View style={styles.strip} pointerEvents="none">
          <View style={styles.frameRow}>
            {Array.from({ length: frameCount }).map((_, index) => {
              const isMajor = index % 5 === 0;

              return (
                <View
                  key={index}
                  style={[
                    styles.frameTick,
                    isMajor && styles.frameTickMajor,
                  ]}
                />
              );
            })}
          </View>

          <View style={[styles.progressFill, { width: playheadX }]} />
          <View style={[styles.playheadLine, { left: playheadX - 1 }]} />
        </View>

        <TouchableOpacity
          style={styles.frameButton}
          activeOpacity={0.75}
          onPress={() => nudgeByFrames(1)}
        >
          <Text style={styles.frameButtonText}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.timeRow} pointerEvents="none">
        <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
        <Text style={styles.timeText}>{formatTime(duration)}</Text>
      </View>
    </View>
  );
};
