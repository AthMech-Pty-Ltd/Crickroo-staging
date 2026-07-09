import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Dimensions,
  StatusBar,
  Image,
  ViewToken,
  Modal,
  TextInput,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Video from 'react-native-video';
import RNFS from 'react-native-fs';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeftIcon,
  HeartIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  ChatCircleTextIcon,
  CrosshairIcon,
  PencilSimpleIcon,
  PlayIcon,
  PauseIcon,
} from 'phosphor-react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { styles } from './styles';
import { DeliveryClip } from '../../../types';
import { colors } from '../../../theme/colors';
import { EditOutcomeModal } from '../../../components/common/EditOutcomeModal';
import {
  TagPlayersModal,
  TagPlayer,
  TagSelection,
} from '../../../components/highlights/TagPlayersModal';
import { SessionPlayer } from '../../../types/session';
import { FilmstripScrubber } from '../../../components/highlights/FilmstripScrubber';
import { sessionService } from '../../../services/session.service';
import { mapClipsToDeliveries } from '../../../utils/highlights';
import { useSessionFavorites } from '../../../hooks/useFavorites';
import { storage } from '../../../utils/storage';
import { BallTrajectoryOverlay } from '../../../components/highlights/BallTrajectoryOverlay';
import { ballTrackingService } from '../../../services/ballTracking.service';
import {
  BallTrajectoryResponse,
  BallDetail,
  buildBallId,
} from '../../../types/ballTracking';
import { AppMode } from '../../../types/auth';
import { usePremiumGate } from '../../../hooks/usePremiumGate';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const MIN_VIDEO_SCALE = 1;
const MAX_VIDEO_SCALE = 5;

const clamp = (value: number, min: number, max: number) => {
  'worklet';
  return Math.min(Math.max(value, min), max);
};

const formatZoomLevel = (zoomLevel: number) =>
  `${Number.isInteger(zoomLevel) ? zoomLevel.toFixed(0) : zoomLevel.toFixed(1)}x`;

const formatDisplayLabel = (value?: string | null) => {
  if (!value) return null;

  return value
    .replace(/_/g, ' ')
    .trim()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Survives ReelItem remounts — avoids filmstrip disappearing on scroll-back
const durationCache = new Map<string, number>();
// remoteUrl → file:// path — shared between Video and FilmstripScrubber
const localUriCache = new Map<string, string>();

function reelTmpPath(remoteUrl: string): string {
  // Strip query parameters to get the base URL
  const baseUrl = remoteUrl.split('?')[0];
  const segment = baseUrl.split('/').pop() ?? 'clip';

  // Generate a simple, fast arithmetic hash of the base URL to ensure uniqueness
  // across sessions while still matching the same file when presigned tokens change.
  let hash = 0;
  for (let i = 0; i < baseUrl.length; i++) {
    hash = (hash * 31 + baseUrl.charCodeAt(i)) % 1000000007;
  }
  const urlHash = hash.toString(36);

  const dir = RNFS.TemporaryDirectoryPath.endsWith('/')
    ? RNFS.TemporaryDirectoryPath
    : `${RNFS.TemporaryDirectoryPath}/`;

  const cleanSegment = segment.endsWith('.mp4') ? segment : `${segment}.mp4`;
  return `${dir}reel_${urlHash}_${cleanSegment}`;
}

async function downloadClip(
  remoteUrl: string,
  onJobId: (id: number) => void,
): Promise<string> {
  const cached = localUriCache.get(remoteUrl);
  if (cached) return cached;

  const localPath = reelTmpPath(remoteUrl);

  if (await RNFS.exists(localPath)) {
    const stat = await RNFS.stat(localPath);
    if (Number(stat.size) > 0) {
        const uri = `file://${localPath}`;
      localUriCache.set(remoteUrl, uri);
      return uri;
    }
    await RNFS.unlink(localPath).catch(() => {});
  }

  const task = RNFS.downloadFile({ fromUrl: remoteUrl, toFile: localPath });
  onJobId(task.jobId);
  await task.promise;
  const uri = `file://${localPath}`;
  localUriCache.set(remoteUrl, uri);
  return uri;
}

// ─── Types ──────────────────────────────────────────────────────────────────

interface HighlightReelScreenProps {
  initialDeliveries: DeliveryClip[];
  initialIndex: number;
  sessionId: string;
  sessionNumber: number;
  sessionName: string;
  sessionDate: number;
  initialPage: number;
  totalPages: number;
  sessionMode?: AppMode;
  sessionType?: 'group' | 'solo';
  players?: SessionPlayer[];
  onBack: () => void;
}

interface ReelItemProps {
  item: DeliveryClip;
  isActive: boolean;
  topOffset: number;
  bottomOffset: number;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  cricId: string | undefined;
  sessionNumber: number;
  tagPlayers: TagPlayer[];
  onNext: () => void;
  onPrevious: () => void;
  canTagPlayers: boolean;
}

// ─── ReelItem ────────────────────────────────────────────────────────────────

const ReelItem: React.FC<ReelItemProps> = ({
  item,
  isActive,
  topOffset,
  bottomOffset,
  isFavorite,
  onToggleFavorite,
  cricId,
  sessionNumber,
  tagPlayers,
  onNext,
  onPrevious,
  canTagPlayers,
}) => {
  const { hasFeature, requireFeature } = usePremiumGate();
  const canUseBallTracking = hasFeature('ball_tracking');

  const [manuallyPaused, setManuallyPaused] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [outcomeModalVisible, setOutcomeModalVisible] = useState(false);
  const [tagModalVisible, setTagModalVisible] = useState(false);
  const [tagModalMode, setTagModalMode] = useState<'batter' | 'bowler' | undefined>();
  const [notesModalVisible, setNotesModalVisible] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [noteSaving, setNoteSaving] = useState(false);
  const [notesLoading, setNotesLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [trajectory, setTrajectory] = useState<BallTrajectoryResponse | null>(
    null,
  );
  const [trajectoryVisible, setTrajectoryVisible] = useState(false);
  const [trajectoryLoading, setTrajectoryLoading] = useState(false);
  const [trajectoryUnavailable, setTrajectoryUnavailable] = useState(false);
  const [ballDetail, setBallDetail] = useState<BallDetail | null>(null);
  const [playerTags, setPlayerTags] = useState<{
    batter_id: string | null;
    bowler_id: string | null;
  }>({ batter_id: null, bowler_id: null });
  const [isVideoZoomed, setIsVideoZoomed] = useState(false);
  const [videoZoomLevel, setVideoZoomLevel] = useState(1);
  const videoScale = useSharedValue(1);
  const savedVideoScale = useSharedValue(1);
  const videoTranslateX = useSharedValue(0);
  const videoTranslateY = useSharedValue(0);
  const savedVideoTranslateX = useSharedValue(0);
  const savedVideoTranslateY = useSharedValue(0);

  const [playbackOverlayIcon, setPlaybackOverlayIcon] = useState<'play' | 'pause'>('play');
  const playbackOverlayOpacity = useSharedValue(0);
  const playbackOverlayScale = useSharedValue(1);

  useEffect(() => {
    setTrajectory(null);
    setTrajectoryVisible(false);
    setTrajectoryLoading(false);
    setTrajectoryUnavailable(false);
  }, [item.id, item.ballNumber]);

  const ballOwnerCricId = item.configVideoKey?.split('/')[0] ?? cricId;

  // Fetch free tag metadata for everyone. Premium users additionally fetch full ball analytics.
  useEffect(() => {
    if (item.isHighlight || !ballOwnerCricId || !sessionNumber || !item.ballNumber) {
      setPlayerTags({ batter_id: null, bowler_id: null });
      setBallDetail(null);
      return;
    }

    const id = buildBallId(ballOwnerCricId, sessionNumber, item.ballNumber);
    let cancelled = false;

    ballTrackingService
      .getPlayers(id)
      .then(data => {
        if (!cancelled) {
          setPlayerTags({
            batter_id: data.batter_id,
            bowler_id: data.bowler_id,
          });
        }
      })
      .catch(err => console.warn('[Ball] player tags fetch failed:', err));

    if (canUseBallTracking) {
      ballTrackingService
        .getBall(id)
        .then(data => {
          if (!cancelled) setBallDetail(data);
        })
        .catch(err => console.warn('[Ball] detail fetch failed:', err));
    } else {
      setBallDetail(null);
    }

    return () => {
      cancelled = true;
    };
  }, [
    item.isHighlight,
    ballOwnerCricId,
    sessionNumber,
    item.ballNumber,
    canUseBallTracking,
  ]);

  const handleBallTrackingPress = useCallback(async () => {
    await requireFeature('ball_tracking', async () => {
      // Toggle if already loaded
      if (trajectory) {
        setTrajectoryVisible(v => !v);
        return;
      }
      if (!ballOwnerCricId || !sessionNumber || !item.ballNumber) {
        console.warn('[BallTracking] Missing cricId/sessionNumber/ballNumber', {
          cricId,
          sessionNumber,
          ballNumber: item.ballNumber,
        });
        return;
      }
      const id = buildBallId(ballOwnerCricId, sessionNumber, item.ballNumber);
      setTrajectoryLoading(true);
      setTrajectoryUnavailable(false);
      try {
        const data = await ballTrackingService.getTrajectory(id);
        setTrajectory(data);
        setTrajectoryVisible(true);
      } catch (err) {
        const status = (err as any)?.response?.status;
        if (status === 404) {
          setTrajectory(null);
          setTrajectoryVisible(false);
          setTrajectoryUnavailable(true);
          console.warn('[BallTracking] trajectory not available:', id);
        } else {
          console.error('[BallTracking] fetch failed:', err);
        }
      } finally {
        setTrajectoryLoading(false);
      }
    });
  }, [
    requireFeature,
    trajectory,
    ballOwnerCricId,
    sessionNumber,
    item.ballNumber,
  ]);

  const updateZoomLevel = useCallback((zoomLevel: number) => {
    setVideoZoomLevel(zoomLevel);
    setIsVideoZoomed(zoomLevel > MIN_VIDEO_SCALE);
  }, []);

  useAnimatedReaction(
    () => Math.round(videoScale.value * 10) / 10,
    (zoomLevel, previousZoomLevel) => {
      if (zoomLevel !== previousZoomLevel) {
        runOnJS(updateZoomLevel)(zoomLevel);
      }
    },
    [updateZoomLevel],
  );

  const resetVideoZoom = useCallback(() => {
    setIsVideoZoomed(false);
    videoScale.value = withTiming(1);
    savedVideoScale.value = 1;
    videoTranslateX.value = withTiming(0);
    videoTranslateY.value = withTiming(0);
    savedVideoTranslateX.value = 0;
    savedVideoTranslateY.value = 0;
  }, [
    savedVideoScale,
    savedVideoTranslateX,
    savedVideoTranslateY,
    videoScale,
    videoTranslateX,
    videoTranslateY,
  ]);

  const toggleVideoZoom = useCallback(() => {
    setIsVideoZoomed(prev => {
      const nextZoomed = !prev;
      const nextScale = nextZoomed ? 3 : 1;

      videoScale.value = withTiming(nextScale);
      savedVideoScale.value = nextScale;
      videoTranslateX.value = withTiming(0);
      videoTranslateY.value = withTiming(0);
      savedVideoTranslateX.value = 0;
      savedVideoTranslateY.value = 0;

      return nextZoomed;
    });
  }, [
    savedVideoScale,
    savedVideoTranslateX,
    savedVideoTranslateY,
    videoScale,
    videoTranslateX,
    videoTranslateY,
  ]);

  const clampVideoTranslation = useCallback(() => {
    'worklet';
    const maxOffsetX = ((videoScale.value - 1) * SCREEN_WIDTH) / 2;
    const maxOffsetY = ((videoScale.value - 1) * SCREEN_HEIGHT) / 2;
    videoTranslateX.value = clamp(
      videoTranslateX.value,
      -maxOffsetX,
      maxOffsetX,
    );
    videoTranslateY.value = clamp(
      videoTranslateY.value,
      -maxOffsetY,
      maxOffsetY,
    );
  }, [videoScale, videoTranslateX, videoTranslateY]);

  const pinchGesture = Gesture.Pinch()
    .onUpdate(event => {
      videoScale.value = clamp(
        savedVideoScale.value * event.scale,
        MIN_VIDEO_SCALE,
        MAX_VIDEO_SCALE,
      );
      clampVideoTranslation();
    })
    .onEnd(() => {
      if (videoScale.value <= MIN_VIDEO_SCALE + 0.01) {
        videoScale.value = withTiming(MIN_VIDEO_SCALE);
        savedVideoScale.value = MIN_VIDEO_SCALE;
        videoTranslateX.value = withTiming(0);
        videoTranslateY.value = withTiming(0);
        savedVideoTranslateX.value = 0;
        savedVideoTranslateY.value = 0;
        return;
      }
      savedVideoScale.value = videoScale.value;
      clampVideoTranslation();
      savedVideoTranslateX.value = videoTranslateX.value;
      savedVideoTranslateY.value = videoTranslateY.value;
    });

  const panGesture = Gesture.Pan()
    .enabled(isVideoZoomed)
    .onUpdate(event => {
      if (videoScale.value <= MIN_VIDEO_SCALE) return;
      const maxOffsetX = ((videoScale.value - 1) * SCREEN_WIDTH) / 2;
      const maxOffsetY = ((videoScale.value - 1) * SCREEN_HEIGHT) / 2;
      videoTranslateX.value = clamp(
        savedVideoTranslateX.value + event.translationX,
        -maxOffsetX,
        maxOffsetX,
      );
      videoTranslateY.value = clamp(
        savedVideoTranslateY.value + event.translationY,
        -maxOffsetY,
        maxOffsetY,
      );
    })
    .onEnd(() => {
      savedVideoTranslateX.value = videoTranslateX.value;
      savedVideoTranslateY.value = videoTranslateY.value;
    });

  const verticalSwipeGesture = Gesture.Pan()
    .enabled(isActive && !isVideoZoomed && !isScrubbing)
    .activeOffsetY([-40, 40])
    .failOffsetX([-90, 90])
    .onEnd(event => {
      const enoughDistance = Math.abs(event.translationY) > 80;
      const enoughVelocity = Math.abs(event.velocityY) > 700;
      if (!enoughDistance && !enoughVelocity) return;

      if (event.translationY > 0 || event.velocityY > 700) {
        runOnJS(onPrevious)();
      } else if (event.translationY < 0 || event.velocityY < -700) {
        runOnJS(onNext)();
      }
    });

  const videoGesture = Gesture.Simultaneous(
    pinchGesture,
    panGesture,
    verticalSwipeGesture,
  );

  const zoomedVideoStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: videoTranslateX.value },
      { translateY: videoTranslateY.value },
      { scale: videoScale.value },
    ],
  }));

  const playbackOverlayStyle = useAnimatedStyle(() => ({
    opacity: playbackOverlayOpacity.value,
    transform: [{ scale: playbackOverlayScale.value }],
  }));

  const showPlaybackOverlay = useCallback(
    (nextPaused: boolean) => {
      setPlaybackOverlayIcon(nextPaused ? 'pause' : 'play');

      playbackOverlayOpacity.value = 1;
      playbackOverlayScale.value = 0.75;

      playbackOverlayScale.value = withTiming(1.12, { duration: 130 }, () => {
        playbackOverlayScale.value = withTiming(1, { duration: 120 });
      });

      playbackOverlayOpacity.value = withDelay(
        220,
        withTiming(0, { duration: 350 }),
      );
    },
    [playbackOverlayOpacity, playbackOverlayScale],
  );

  const togglePlayback = useCallback(() => {
    setManuallyPaused(prev => {
      const nextPaused = !prev;
      showPlaybackOverlay(nextPaused);
      return nextPaused;
    });
  }, [showPlaybackOverlay]);

  const handleOutcomeDone = useCallback(
    async (outcome: string) => {
      if (!ballOwnerCricId || !sessionNumber || !item.ballNumber) {
        console.warn('[Outcome] Missing cricId/sessionNumber/ballNumber', {
          cricId,
          sessionNumber,
          ballNumber: item.ballNumber,
        });
        setOutcomeModalVisible(false);
        return;
      }
      const id = buildBallId(ballOwnerCricId, sessionNumber, item.ballNumber);
      // API expects a snake_cased value, e.g. "Clean Bowled" -> "clean_bowled".
      const hit = outcome.trim().toLowerCase().replace(/\s+/g, '_');
      try {
        await ballTrackingService.updateOutcome(id, hit);
        // Reflect the new outcome.hit in the reel's info line instantly.
        setBallDetail(prev =>
          prev
            ? {
                ...prev,
                outcome: { hit, wagonwheel: prev.outcome?.wagonwheel ?? null },
              }
            : prev,
        );
        setOutcomeModalVisible(false);
      } catch (err) {
        console.error('[Outcome] update failed:', err);
      }
    },
    [ballOwnerCricId, sessionNumber, item.ballNumber],
  );

  const handleTagDone = useCallback(
    async (selection: TagSelection) => {
      if (!ballOwnerCricId || !sessionNumber || !item.ballNumber) {
        console.warn('[Tag] Missing cricId/sessionNumber/ballNumber', {
          cricId,
          sessionNumber,
          ballNumber: item.ballNumber,
        });
        setTagModalVisible(false);
        setTagModalMode(undefined);
        return;
      }
      const id = buildBallId(ballOwnerCricId, sessionNumber, item.ballNumber);
      try {
        await ballTrackingService.updatePlayers(id, {
          batter_id: selection.batsmanId,
          bowler_id: selection.bowlerId,
        });
        setPlayerTags({
          batter_id: selection.batsmanId,
          bowler_id: selection.bowlerId,
        });
        setBallDetail(prev =>
          prev
            ? {
                ...prev,
                batter_id: selection.batsmanId,
                bowler_id: selection.bowlerId,
              }
            : prev,
        );
        setTagModalVisible(false);
        setTagModalMode(undefined);
      } catch (err: any) {
        console.error('[Tag] update failed:', {
          status: err?.response?.status,
          data: err?.response?.data,
          url: err?.config?.url,
          method: err?.config?.method,
          payload: err?.config?.data,
          message: err?.message,
        });
      }
    },
    [ballOwnerCricId, sessionNumber, item.ballNumber],
  );

  const handleOpenNotes = useCallback(async () => {
    setNotesModalVisible(true);

    if (!ballOwnerCricId || !sessionNumber || !item.ballNumber) {
      console.warn('[Notes] Missing cricId/sessionNumber/ballNumber', {
        cricId,
        sessionNumber,
        ballNumber: item.ballNumber,
      });
      return;
    }

    const id = buildBallId(ballOwnerCricId, sessionNumber, item.ballNumber);
    try {
      setNotesLoading(true);
      const latest = await ballTrackingService.getBall(id);
      setBallDetail(latest);
    } catch (err: any) {
      console.error('[Notes] load failed:', {
        status: err?.response?.status,
        data: err?.response?.data,
        url: err?.config?.url,
        method: err?.config?.method,
        message: err?.message,
      });
    } finally {
      setNotesLoading(false);
    }
  }, [ballOwnerCricId, sessionNumber, item.ballNumber]);

  const handleSaveNote = useCallback(async () => {
    const trimmed = noteText.trim();
    if (!trimmed || noteSaving) return;

    if (!ballOwnerCricId || !sessionNumber || !item.ballNumber) {
      console.warn('[Notes] Missing cricId/sessionNumber/ballNumber', {
        cricId,
        sessionNumber,
        ballNumber: item.ballNumber,
      });
      return;
    }

    const id = buildBallId(ballOwnerCricId, sessionNumber, item.ballNumber);
    try {
      setNoteSaving(true);
      const response = await ballTrackingService.addNote(id, trimmed);
      try {
        const latest = await ballTrackingService.getBall(id);
        setBallDetail(latest);
      } catch {
        setBallDetail(prev =>
          prev
            ? {
                ...prev,
                notes: [...(prev.notes ?? []), response.note],
              }
            : prev,
        );
      }
      setNoteText('');
    } catch (err: any) {
      console.error('[Notes] save failed:', {
        status: err?.response?.status,
        data: err?.response?.data,
        url: err?.config?.url,
        method: err?.config?.method,
        payload: err?.config?.data,
        message: err?.message,
      });
    } finally {
      setNoteSaving(false);
    }
  }, [noteText, noteSaving, ballOwnerCricId, sessionNumber, item.ballNumber]);

  const [duration, setDuration] = useState(() =>
    item.videoUrl ? durationCache.get(item.videoUrl) ?? 0 : 0,
  );
  const [localVideoUri, setLocalVideoUri] = useState<string | null>(() =>
    item.videoUrl ? localUriCache.get(item.videoUrl) ?? null : null,
  );

  const videoRef = useRef<any>(null);
  const isSeekingRef = useRef(false);

  const pendingSeekRef = useRef<{ time: number; tolerance: number } | null>(
    null,
  );
  const seekInFlightRef = useRef(false);
  const seekTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const lastDragSampleRef = useRef<{ time: number; at: number }>({
    time: 0,
    at: 0,
  });

  const dispatchPendingSeek = useCallback(() => {
    if (seekInFlightRef.current) return;
    const pending = pendingSeekRef.current;
    if (!pending) return;
    pendingSeekRef.current = null;
    seekInFlightRef.current = true;
    videoRef.current?.seek(pending.time, pending.tolerance);

    if (seekTimeoutRef.current) clearTimeout(seekTimeoutRef.current);
    seekTimeoutRef.current = setTimeout(() => {
      seekInFlightRef.current = false;
      dispatchPendingSeek();
    }, 500);
  }, []);

  const isPlaying = isActive && !manuallyPaused && !isScrubbing;

  useEffect(() => {
    if (!isActive) {
      setManuallyPaused(false);
      setIsScrubbing(false);
      isSeekingRef.current = false;
      pendingSeekRef.current = null;
      seekInFlightRef.current = false;
      if (seekTimeoutRef.current) {
        clearTimeout(seekTimeoutRef.current);
        seekTimeoutRef.current = null;
      }
      playbackOverlayOpacity.value = 0;
      videoRef.current?.seek(0);
      setCurrentTime(0);
      resetVideoZoom();
    }
  }, [isActive, playbackOverlayOpacity, resetVideoZoom]);

  // Ref so the download effect can read current localVideoUri without it being a dep
  const localVideoUriRef = useRef(localVideoUri);
  localVideoUriRef.current = localVideoUri;

  // Only download when the clip is active — one download at a time, caches persist for scroll-back
  useEffect(() => {
    if (!isActive || !item.videoUrl) return;
    if (localVideoUriRef.current) return; // already ready

    // Memory cache hit — no download needed
    const cached = localUriCache.get(item.videoUrl);
    if (cached) {
      setLocalVideoUri(cached);
      return;
    }

    let cancelled = false;
    let jobId: number | null = null;

    downloadClip(item.videoUrl, id => {
      jobId = id;
    })
      .then(uri => {
        jobId = null;
        if (!cancelled) setLocalVideoUri(uri);
      })
      .catch(() => {
        jobId = null;
      });

    return () => {
      cancelled = true;
      // Do NOT stopDownload on deactivation — let it finish and populate the cache
      // so scroll-back is instant. Only cancel if component fully unmounts with an active job.
      if (jobId !== null) {
        try {
          RNFS.stopDownload(jobId);
        } catch {}
      }
    };
  }, [isActive, item.videoUrl]);

  const thumbnailSource =
    typeof item.thumbnail === 'number' || typeof item.thumbnail === 'object'
      ? (item.thumbnail as any)
      : { uri: item.thumbnail as string };

  // Stable object reference — prevents react-native-video from restarting on every onProgress re-render
  const videoSource = useMemo(
    () => (localVideoUri ? { uri: localVideoUri } : null),
    [localVideoUri],
  );

  // ── Derived display values from the ball-detail API ──
  const speedAtBounce = ballDetail?.metrics?.speed_at_bounce_kmph;
  const speedAfterBounce = ballDetail?.metrics?.speed_after_bounce_kmph;
  const deviation = ballDetail?.metrics?.deviation_degrees;
  const showStatsBox =
    canUseBallTracking &&
    (speedAtBounce != null || speedAfterBounce != null || deviation != null);

  const ballNumberLabel = ballDetail?.ball_number ?? item.ballNumber;

  const outcomeLabel = formatDisplayLabel(ballDetail?.outcome?.hit);
  const lengthLabel = formatDisplayLabel(ballDetail?.pitch_map?.outcome);

  // batter_id / bowler_id are userIds (TagPlayer.id is the userId).
  const findPlayerName = (id: string | null | undefined): string | null => {
    if (!id) return null;
    return tagPlayers.find(p => p.id === id)?.name ?? null;
  };
  const batsmanName = findPlayerName(playerTags.batter_id);
  const bowlerName = findPlayerName(playerTags.bowler_id);

  // Current tagging, used to auto-select in the Tag Players modal. Memoised so
  // the modal doesn't reset an in-progress selection on every render.
  const tagSelection = useMemo<TagSelection>(
    () => ({
      batsmanId: playerTags.batter_id,
      bowlerId: playerTags.bowler_id,
    }),
    [playerTags.batter_id, playerTags.bowler_id],
  );

  return (
    <GestureDetector gesture={videoGesture}>
      <View
        style={[
          styles.reelItem,
          { height: SCREEN_HEIGHT, width: SCREEN_WIDTH },
        ]}
      >
        {/* ── Thumbnail shown while local file is downloading ─── */}
        <Animated.View style={[styles.zoomableMedia, zoomedVideoStyle]}>
          <Image
            source={thumbnailSource}
            style={styles.media}
            resizeMode="cover"
          />

          {/* ── Video — only mounted once local file is ready (instant seeks) ─── */}
          {videoSource && (
            <Video
              ref={videoRef}
              source={videoSource}
              style={styles.media}
              resizeMode="cover"
              paused={!isPlaying}
              repeat
              progressUpdateInterval={100}
              playInBackground={false}
              ignoreSilentSwitch="ignore"
              onLoad={(data: any) => {
                if (item.videoUrl)
                  durationCache.set(item.videoUrl, data.duration);
                setDuration(data.duration);
              }}
              onProgress={(data: any) => {
                if (!isSeekingRef.current) setCurrentTime(data.currentTime);
              }}
              onSeek={() => {
                if (seekTimeoutRef.current) {
                  clearTimeout(seekTimeoutRef.current);
                  seekTimeoutRef.current = null;
                }
                seekInFlightRef.current = false;
                dispatchPendingSeek();
              }}
              onError={() => {}}
            />
          )}
        </Animated.View>

        {/* ── Ball tracking SVG overlay ─── */}
        {canUseBallTracking && trajectoryVisible && trajectory && (
          <Animated.View
            style={[styles.zoomableMedia, zoomedVideoStyle]}
            pointerEvents="none"
          >
            <BallTrajectoryOverlay
              data={trajectory}
              currentTime={currentTime}
              isPlaying={isPlaying}
              width={SCREEN_WIDTH}
              height={SCREEN_HEIGHT}
            />
          </Animated.View>
        )}

        {/* ── Gradients (non-interactive) ─── */}
        <LinearGradient
          colors={[colors.glass.black_60, 'transparent']}
          style={styles.topGradient}
          pointerEvents="none"
        />
        <LinearGradient
          colors={['transparent', colors.glass.black_60]}
          style={styles.bottomGradient}
          pointerEvents="none"
        />

        {/* ── Full-screen tap → toggle play/pause ─── */}
        <TouchableOpacity
          style={styles.tapOverlay}
          activeOpacity={1}
          onPress={togglePlayback}
        >
          <Animated.View style={[styles.playButton, playbackOverlayStyle]}>
            {playbackOverlayIcon === 'play' ? (
              <PlayIcon
                size={40}
                color={colors.neutrals.white}
                weight="regular"
              />
            ) : (
              <PauseIcon
                size={40}
                color={colors.neutrals.white}
                weight="regular"
              />
            )}
          </Animated.View>
        </TouchableOpacity>

        {/* ── Stats row ─── */}
        {!item.isHighlight && showStatsBox && (
          <View style={[styles.statsRow, { top: topOffset + 60 }]}>
            <View style={styles.statsOverlay} pointerEvents="none">
              {speedAtBounce != null && (
                <Text style={styles.statSpeed}>
                  {Math.round(speedAtBounce)} KMPH at bounce
                </Text>
              )}
              {speedAfterBounce != null && (
                <Text style={styles.statSpeed}>
                  {Math.round(speedAfterBounce)} KMPH after bounce
                </Text>
              )}
              {deviation != null && (
                <Text style={styles.statDeviation}>
                  {deviation}° Deviation
                </Text>
              )}
            </View>
          </View>
        )}

        {/* ── Right side: action icons ─── */}
        <View style={[styles.rightActions, { bottom: bottomOffset + 120 }]}>
          <TouchableOpacity
            style={styles.actionItem}
            activeOpacity={0.7}
            onPress={toggleVideoZoom}
          >
            <View style={styles.actionIconWrapper}>
              {isVideoZoomed ? (
                <MagnifyingGlassMinusIcon
                  size={20}
                  color={colors.neutrals.white}
                  weight="regular"
                />
              ) : (
                <MagnifyingGlassPlusIcon
                  size={20}
                  color={colors.neutrals.white}
                  weight="regular"
                />
              )}
            </View>
            <Text style={styles.actionLabel}>
              {isVideoZoomed ? formatZoomLevel(videoZoomLevel) : 'Zoom'}
            </Text>
          </TouchableOpacity>

          {!item.isHighlight && (
            <>
              <TouchableOpacity
                style={styles.actionItem}
                activeOpacity={0.7}
                onPress={onToggleFavorite}
              >
                <View style={styles.actionIconWrapper}>
                  <HeartIcon
                    size={20}
                    color={
                      isFavorite ? colors.error[50] : colors.neutrals.white
                    }
                    weight={isFavorite ? 'fill' : 'regular'}
                  />
                </View>
                <Text style={styles.actionLabel}>Like</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionItem}
                activeOpacity={0.7}
                onPress={() =>
                  requireFeature('ball_tracking', handleOpenNotes)
                }
              >
                <View style={styles.actionIconWrapper}>
                  <ChatCircleTextIcon
                    size={20}
                    color={colors.neutrals.white}
                    weight="regular"
                  />
                </View>
                <Text style={styles.actionLabel}>Notes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionItem}
                activeOpacity={trajectoryUnavailable ? 1 : 0.7}
                onPress={handleBallTrackingPress}
                disabled={false}
              >
                <View style={styles.actionIconWrapper}>
                  <CrosshairIcon
                    size={20}
                    color={
                      trajectoryUnavailable
                        ? colors.neutrals.taupe_grey
                        : colors.neutrals.white
                    }
                    weight={trajectoryVisible ? 'fill' : 'regular'}
                  />
                </View>
                <Text style={styles.actionLabel}>
                  {trajectoryLoading
                    ? 'Load'
                    : trajectoryUnavailable
                    ? 'No Track'
                    : trajectoryVisible
                    ? 'Hide'
                    : 'Track'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionItem}
                activeOpacity={0.7}
                onPress={() =>
                  requireFeature('ball_tracking', () =>
                    setOutcomeModalVisible(true),
                  )
                }
              >
                <View style={styles.actionIconWrapper}>
                  <PencilSimpleIcon size={20} color={colors.neutrals.white} />
                </View>
                <Text style={styles.actionLabel}>Outcome</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <EditOutcomeModal
          isVisible={outcomeModalVisible}
          onDone={handleOutcomeDone}
          onClose={() => setOutcomeModalVisible(false)}
        />

        <TagPlayersModal
          isVisible={tagModalVisible}
          players={tagPlayers}
          initialSelection={tagSelection}
          mode={tagModalMode}
          onClose={() => {
            setTagModalVisible(false);
            setTagModalMode(undefined);
          }}
          onDone={handleTagDone}
        />

        <Modal
          visible={notesModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setNotesModalVisible(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.notesModalOverlay}
          >
            <TouchableOpacity
              style={styles.notesModalBackdrop}
              activeOpacity={1}
              onPress={() => setNotesModalVisible(false)}
            />
            <View style={styles.notesSheet}>
              <View style={styles.notesHandle} />

              <View style={styles.notesHeader}>
                <View>
                  <Text style={styles.notesTitle}>Coach Notes</Text>
                  <Text style={styles.notesSubtitle}>
                    Ball #{ballNumberLabel}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.notesCloseButton}
                  activeOpacity={0.75}
                  onPress={() => setNotesModalVisible(false)}
                >
                  <Text style={styles.notesCloseText}>Close</Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.notesList}
                contentContainerStyle={styles.notesListContent}
                keyboardShouldPersistTaps="handled"
              >
                {notesLoading ? (
                  <View style={styles.emptyNotesCard}>
                    <ActivityIndicator size="small" color={colors.neutrals.white} />
                    <Text style={styles.emptyNotesText}>Loading notes...</Text>
                  </View>
                ) : (ballDetail?.notes ?? []).length > 0 ? (
                  [...(ballDetail?.notes ?? [])]
                    .sort(
                      (a, b) =>
                        new Date(b.created_at).getTime() -
                        new Date(a.created_at).getTime(),
                    )
                    .map(note => (
                    <View key={note.id} style={styles.noteCard}>
                      <View style={styles.noteCardHeader}>
                        <Text style={styles.noteCoachName}>
                          {note.coach_name || 'Coach'}
                        </Text>
                        <Text style={styles.noteTime}>
                          {new Date(note.created_at).toLocaleDateString()}
                        </Text>
                      </View>
                      <Text style={styles.noteBody}>{note.note}</Text>
                    </View>
                  ))
                ) : (
                  <View style={styles.emptyNotesCard}>
                    <Text style={styles.emptyNotesTitle}>No notes yet</Text>
                    <Text style={styles.emptyNotesText}>
                      Add a coaching note for this delivery.
                    </Text>
                  </View>
                )}
              </ScrollView>

              <View style={styles.noteInputCard}>
                <TextInput
                  style={styles.noteInput}
                  value={noteText}
                  onChangeText={setNoteText}
                  placeholder="Write a note..."
                  placeholderTextColor={colors.neutrals[60]}
                  multiline
                  textAlignVertical="top"
                />
                <TouchableOpacity
                  style={[
                    styles.saveNoteButton,
                    (!noteText.trim() || noteSaving) && styles.saveNoteButtonDisabled,
                  ]}
                  activeOpacity={0.8}
                  disabled={!noteText.trim() || noteSaving}
                  onPress={handleSaveNote}
                >
                  {noteSaving ? (
                    <ActivityIndicator size="small" color={colors.neutrals.white} />
                  ) : (
                    <Text style={styles.saveNoteButtonText}>Save Note</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* ── Filmstrip scrubber ─── */}
        {localVideoUri && duration > 0 && (
          <View
            style={[styles.filmstripContainer, { bottom: bottomOffset + 16 }]}
          >
            <FilmstripScrubber
              videoUrl={localVideoUri}
              duration={duration}
              currentTime={currentTime}
              isActive={isActive}
              onSeekStart={() => {
                isSeekingRef.current = true;
                setIsScrubbing(true);
                lastDragSampleRef.current = { time: currentTime, at: Date.now() };
              }}
              onSeek={t => {
                setCurrentTime(t);

                const now = Date.now();
                const last = lastDragSampleRef.current;
                const dt = now - last.at;
                const velocity = dt > 0 ? Math.abs(t - last.time) / dt : 0;
                lastDragSampleRef.current = { time: t, at: now };

                const tolerance = velocity > 0.003 ? 0.5 : 0.1;
                pendingSeekRef.current = { time: t, tolerance };
                dispatchPendingSeek();
              }}
              onSeekEnd={t => {
                setCurrentTime(t);
                isSeekingRef.current = false;
                setIsScrubbing(false);
                pendingSeekRef.current = null;
                if (seekTimeoutRef.current) {
                  clearTimeout(seekTimeoutRef.current);
                  seekTimeoutRef.current = null;
                }
                seekInFlightRef.current = true;
                videoRef.current?.seek(t, 0);
                seekTimeoutRef.current = setTimeout(() => {
                  seekInFlightRef.current = false;
                  dispatchPendingSeek();
                }, 250);
              }}
            />
          </View>
        )}

        {/* ── Bottom: ball info ─── */}
        <View style={[styles.bottomInfo, { paddingBottom: bottomOffset + 88 }]}>
          <View style={styles.infoWrapper}>
            <Text style={styles.ballNumber}>
              {item.isHighlight ? '#Highlight' : `Ball #${ballNumberLabel}`}
            </Text>
            {(outcomeLabel || lengthLabel) && (
              <View style={styles.ballDetailGroup}>
                {outcomeLabel && (
                  <Text style={styles.ballDetail}>
                    <Text style={styles.ballDetailLabel}>Outcome: </Text>
                    <Text style={styles.ballDetailValue}>{outcomeLabel}</Text>
                  </Text>
                )}
                {lengthLabel && (
                  <Text style={styles.ballDetail}>
                    <Text style={styles.ballDetailLabel}>Length: </Text>
                    <Text style={styles.ballDetailValue}>{lengthLabel}</Text>
                  </Text>
                )}
              </View>
            )}
            {!item.isHighlight && canTagPlayers && (
              <View style={styles.playerTags}>
                <TouchableOpacity
                  style={styles.playerTag}
                  activeOpacity={0.75}
                  onPress={() => {
                    setTagModalMode('batter');
                    setTagModalVisible(true);
                  }}
                >
                  <Text style={styles.playerTagText}>
                    Batter - {batsmanName ?? 'Not tagged'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.playerTag}
                  activeOpacity={0.75}
                  onPress={() => {
                    setTagModalMode('bowler');
                    setTagModalVisible(true);
                  }}
                >
                  <Text style={styles.playerTagText}>
                    Bowler - {bowlerName ?? 'Not tagged'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>
    </GestureDetector>
  );
};

// ─── HighlightReelScreen ─────────────────────────────────────────────────────

export const HighlightReelScreen: React.FC<HighlightReelScreenProps> = ({
  initialDeliveries,
  initialIndex,
  sessionId,
  sessionNumber,
  sessionName,
  sessionDate,
  initialPage,
  totalPages: totalPagesProp,
  sessionMode,
  sessionType,
  players,
  onBack,
}) => {
  const insets = useSafeAreaInsets();
  const canTagPlayers = sessionMode === 'coach' || sessionType === 'group';

  const tagPlayers = useMemo<TagPlayer[]>(
    () =>
      (players ?? [])
        .filter(p => p.cricId)
        .map(p => ({
          id: p.cricId,
          name: p.name,
          code: p.cricId,
        })),
    [players],
  );
  const { isFavorite, toggleFavorite, favoritesVersion } = useSessionFavorites(
    sessionId,
    sessionName,
    sessionDate,
    sessionMode,
  );
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [deliveries, setDeliveries] = useState(initialDeliveries);
  const flatListRef = useRef<FlatList>(null);

  // Refs so the stable onViewableItemsChanged callback can read current values
  const deliveriesRef = useRef(initialDeliveries);
  const currentPageRef = useRef(initialPage);
  const totalPagesRef = useRef(totalPagesProp);
  const isFetchingMore = useRef(false);

  useEffect(() => {
    deliveriesRef.current = deliveries;
  }, [deliveries]);

  // Scroll to the tapped delivery index after mount
  useEffect(() => {
    if (initialIndex > 0) {
      const timer = setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: initialIndex,
          animated: false,
        });
      }, 50);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchNextPage = useCallback(() => {
    if (
      isFetchingMore.current ||
      currentPageRef.current >= totalPagesRef.current
    )
      return;
    isFetchingMore.current = true;
    sessionService
      .getSessionHighlights(sessionId, currentPageRef.current + 1, 5)
      .then(response => {
        const newItems = mapClipsToDeliveries(response.highlights);
        setDeliveries(prev => [...prev, ...newItems]);
        currentPageRef.current = response.page;
        totalPagesRef.current = response.totalPages;
      })
      .catch(err =>
        console.error('[ReelScreen] Failed to load more highlights:', err),
      )
      .finally(() => {
        isFetchingMore.current = false;
      });
  }, [sessionId]);

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 });

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length === 0 || viewableItems[0].index == null) return;
      const index = viewableItems[0].index;
      setCurrentIndex(index);

      // Prefetch next page when user is 3 items from the end of loaded content
      if (index >= deliveriesRef.current.length - 3) {
        fetchNextPage();
      }
    },
  );

  const [cricId, setCricId] = useState<string | undefined>(undefined);
  useEffect(() => {
    storage.getUser().then(u => setCricId(u?.cric_id ?? undefined));
  }, []);

  const goToIndex = useCallback(
    (targetIndex: number) => {
      const maxIndex = deliveriesRef.current.length - 1;
      const nextIndex = Math.max(0, Math.min(targetIndex, maxIndex));
      if (nextIndex === currentIndex) return;

      setCurrentIndex(nextIndex);
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });

      if (nextIndex >= deliveriesRef.current.length - 3) {
        fetchNextPage();
      }
    },
    [currentIndex, fetchNextPage],
  );

  const goToNext = useCallback(() => {
    goToIndex(currentIndex + 1);
  }, [currentIndex, goToIndex]);

  const goToPrevious = useCallback(() => {
    goToIndex(currentIndex - 1);
  }, [currentIndex, goToIndex]);

  const renderItem = useCallback(
    ({ item, index }: { item: DeliveryClip; index: number }) => (
      <ReelItem
        item={item}
        isActive={index === currentIndex}
        topOffset={insets.top}
        bottomOffset={insets.bottom}
        isFavorite={isFavorite(item)}
        onToggleFavorite={() => toggleFavorite(item)}
        cricId={cricId}
        sessionNumber={sessionNumber}
        tagPlayers={tagPlayers}
        canTagPlayers={canTagPlayers}
        onNext={goToNext}
        onPrevious={goToPrevious}
      />
    ),
    [
      currentIndex,
      insets,
      isFavorite,
      toggleFavorite,
      cricId,
      sessionNumber,
      tagPlayers,
      goToNext,
      goToPrevious,
    ],
  );

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      <FlatList
        ref={flatListRef}
        data={deliveries}
        extraData={{ currentIndex, cricId, favoritesVersion }}
        keyExtractor={item => `reel-${item.id}-${item.ballNumber}`}
        renderItem={renderItem}
        pagingEnabled
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={SCREEN_HEIGHT}
        snapToAlignment="start"
        getItemLayout={(_, index) => ({
          length: SCREEN_HEIGHT,
          offset: SCREEN_HEIGHT * index,
          index,
        })}
        initialScrollIndex={initialIndex}
        viewabilityConfig={viewabilityConfig.current}
        onViewableItemsChanged={onViewableItemsChanged.current}
        initialNumToRender={2}
        maxToRenderPerBatch={2}
        windowSize={3}
        onScrollToIndexFailed={info => {
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({
              index: info.index,
              animated: true,
            });
          }, 100);
        }}
      />

      {/* Fixed back button — always on top regardless of scroll position */}
      <TouchableOpacity
        style={[styles.backButton, { top: insets.top + 10 }]}
        onPress={onBack}
        activeOpacity={0.8}
      >
        <ArrowLeftIcon size={20} color={colors.neutrals.white} />
      </TouchableOpacity>
    </View>
  );
};
