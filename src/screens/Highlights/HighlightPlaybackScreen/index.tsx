import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Video from 'react-native-video';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHeaderAnimation } from '../../../hooks/useHeaderAnimation';
import { useSessionFavorites } from '../../../hooks/useFavorites';
import { AppMode } from '../../../types/auth';
import {
  ArrowLeftIcon,
  BoulesIcon,
  CricketIcon,
  PlayIcon,
  CornersOutIcon,
  HeartIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
} from 'phosphor-react-native';
import { styles } from './styles';
import { ASSETS } from '../../../constants/assets';
import { DeliveryClipCard } from '../../../components/highlights/DeliveryClipCard';
import { DeliveryClip } from '../../../types';
import { SessionPlayer } from '../../../types/session';
import { sessionService } from '../../../services/session.service';
import { colors } from '../../../theme/colors';
import { mapClipsToDeliveries } from '../../../utils/highlights';

const MIN_VIDEO_SCALE = 1;
const MAX_VIDEO_SCALE = 4;

const clamp = (value: number, min: number, max: number) => {
  'worklet';
  return Math.min(Math.max(value, min), max);
};

const formatZoomLevel = (zoomLevel: number) =>
  `${Number.isInteger(zoomLevel) ? zoomLevel.toFixed(0) : zoomLevel.toFixed(1)}x`;

interface HighlightPlaybackScreenProps {
  sessionId: string;
  sessionName: string;
  sessionDate: number;
  sessionTag?: string;
  sessionPlayMode?: string;
  sessionMode?: AppMode;
  onBack: () => void;
  onFullscreen: (
    deliveries: DeliveryClip[],
    initialIndex: number,
    currentPage: number,
    totalPages: number,
    players: SessionPlayer[],
  ) => void;
}

export const HighlightPlaybackScreen: React.FC<
  HighlightPlaybackScreenProps
> = ({
  sessionId,
  sessionName,
  sessionDate,
  sessionTag,
  sessionPlayMode,
  sessionMode,
  onBack,
  onFullscreen,
}) => {
  const { width: screenWidth } = useWindowDimensions();
  const videoSize = screenWidth - 40;
  const ModeIcon =
    sessionPlayMode === 'bowling'
      ? BoulesIcon
      : sessionPlayMode === 'batting'
      ? CricketIcon
      : null;
  const { isFavorite, isDownloading, toggleFavorite, favoritesVersion } =
    useSessionFavorites(sessionId, sessionName, sessionDate, sessionMode);
  const [deliveries, setDeliveries] = useState<DeliveryClip[]>([]);
  const [sessionPlayers, setSessionPlayers] = useState<SessionPlayer[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryClip | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalBalls, setTotalBalls] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const isFetchingMore = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isVideoZoomed, setIsVideoZoomed] = useState(false);
  const [videoZoomLevel, setVideoZoomLevel] = useState(1);
  const videoScale = useSharedValue(1);
  const savedVideoScale = useSharedValue(1);
  const videoTranslateX = useSharedValue(0);
  const videoTranslateY = useSharedValue(0);
  const savedVideoTranslateX = useSharedValue(0);
  const savedVideoTranslateY = useSharedValue(0);
  // autoPlay: false — the header only exists after loading, so we trigger manually
  const { headerStyle, triggerAnimation } = useHeaderAnimation({
    autoPlay: false,
  });

  // Trigger the slide-in once data has loaded and the header is mounted
  useEffect(() => {
    if (!isLoading) triggerAnimation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  const formatTime = (seconds: number) => {
    if (!seconds || seconds < 0 || !isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
    const maxOffset = ((videoScale.value - 1) * videoSize) / 2;
    videoTranslateX.value = clamp(videoTranslateX.value, -maxOffset, maxOffset);
    videoTranslateY.value = clamp(videoTranslateY.value, -maxOffset, maxOffset);
  }, [videoScale, videoSize, videoTranslateX, videoTranslateY]);

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
    .onUpdate(event => {
      if (videoScale.value <= MIN_VIDEO_SCALE) return;
      const maxOffset = ((videoScale.value - 1) * videoSize) / 2;
      videoTranslateX.value = clamp(
        savedVideoTranslateX.value + event.translationX,
        -maxOffset,
        maxOffset,
      );
      videoTranslateY.value = clamp(
        savedVideoTranslateY.value + event.translationY,
        -maxOffset,
        maxOffset,
      );
    })
    .onEnd(() => {
      savedVideoTranslateX.value = videoTranslateX.value;
      savedVideoTranslateY.value = videoTranslateY.value;
    });

  const videoGesture = Gesture.Simultaneous(pinchGesture, panGesture);

  const zoomedVideoStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: videoTranslateX.value },
      { translateY: videoTranslateY.value },
      { scale: videoScale.value },
    ],
  }));

  const fetchHighlights = useCallback(
    async (pageNum: number = 1, append: boolean = false) => {
      try {
        if (append) {
          setIsLoadingMore(true);
        } else {
          setIsLoading(true);
        }

        const response = await sessionService.getSessionHighlights(
          sessionId,
          pageNum,
          30,
        );
        const mappedDeliveries = mapClipsToDeliveries(response.highlights?.filter((ele:any)=> !ele.isHighlight) ?? []);

        if (append) {
          setDeliveries(prev => {
            const merged = [...prev, ...mappedDeliveries];
            return merged.sort((a, b) => {
              if (a.isHighlight && !b.isHighlight) return -1;
              if (!a.isHighlight && b.isHighlight) return 1;
              return a.ballNumber - b.ballNumber;
            });
          });
        } else {
          setDeliveries(mappedDeliveries);
          setSelectedDelivery(
            mappedDeliveries.find(item => !item.isHighlight) ?? mappedDeliveries[0] ?? null,
          );
        }

        setCurrentPage(response.page);
        setTotalPages(response.totalPages);
        if (!append) setTotalBalls(response.totalBalls);
        setError(null);
      } catch (err) {
        console.error('Error fetching session highlights:', err);
        setError('Failed to load highlights');
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [sessionId],
  );

  useEffect(() => {
    fetchHighlights(1);
  }, [fetchHighlights]);

  // Fetch the session's players when the session is opened (alongside the
  // highlights fetch). Used to tag batsman/bowler in the reel.
  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;
    sessionService
      .getSessionPlayers(sessionId)
      .then(res => {
        if (!cancelled) setSessionPlayers(res.players ?? []);
      })
      .catch(err => console.warn('Failed to fetch session players:', err));
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const onEndReached = useCallback(() => {
    if (!isFetchingMore.current && currentPage < totalPages) {
      isFetchingMore.current = true;
      fetchHighlights(currentPage + 1, true).finally(() => {
        isFetchingMore.current = false;
      });
    }
  }, [currentPage, totalPages, fetchHighlights]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.primary.main} size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => fetchHighlights(1)}
        >
          <Text style={styles.retryButtonText}>RETRY</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (deliveries.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Animated.View style={[styles.header, headerStyle]}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <ArrowLeftIcon size={24} color={colors.neutrals.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Session Highlights</Text>
        </Animated.View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No highlights found for this session
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={onBack}>
            <Text style={styles.retryButtonText}>GO BACK</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.header, headerStyle]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeftIcon size={24} color={colors.neutrals.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {sessionName}
        </Text>
      </Animated.View>

      {/* Fixed: session highlight */}
      <View style={styles.fixedSection}>
        <Text style={styles.sectionLabel}>SESSION HIGHLIGHT</Text>

        <GestureDetector gesture={videoGesture}>
          <View style={styles.videoCard}>
            <Animated.View style={[styles.zoomableVideo, zoomedVideoStyle]}>
              {selectedDelivery?.videoUrl ? (
                <Video
                  key={selectedDelivery.videoKey || selectedDelivery.videoUrl || String(selectedDelivery.id)}
                  source={{ uri: selectedDelivery.videoUrl }}
                  style={styles.videoThumbnail}
                  resizeMode="cover"
                  paused={!isPlaying}
                  repeat={true}
                  playInBackground={false}
                  ignoreSilentSwitch="ignore"
                  progressUpdateInterval={250.0}
                  onLoad={data => {
                    if (data.duration > 0 && isFinite(data.duration)) {
                      setDuration(data.duration);
                    }
                    setProgress(0);
                    setCurrentTime(0);
                    setIsVideoLoading(false);
                  }}
                  onProgress={data => {
                    setCurrentTime(data.currentTime);
                    if (
                      duration === 0 &&
                      data.seekableDuration > 0 &&
                      isFinite(data.seekableDuration)
                    ) {
                      setDuration(data.seekableDuration);
                    }
                    const total = data.seekableDuration || duration;
                    const percent = (data.currentTime / total) * 100;
                    setProgress(isNaN(percent) ? 0 : percent);
                  }}
                  onEnd={() => {
                    setIsPlaying(false);
                    setProgress(100);
                    setCurrentTime(duration);
                  }}
                />
              ) : (
                <Image
                  source={ASSETS.IMAGES.ONBOARDING_1}
                  style={styles.videoThumbnail}
                  resizeMode="cover"
                />
              )}
            </Animated.View>

            <TouchableOpacity
              style={styles.videoOverlay}
              activeOpacity={1}
              onPress={() => {
                if (!isVideoLoading) setIsPlaying(p => !p);
              }}
            >
              <View style={styles.leftColumn}>
                {!!sessionTag && (
                  <View style={styles.typeBadge}>
                    {ModeIcon && (
                      <ModeIcon
                        size={16}
                        color={colors.neutrals.deep_black}
                        weight="regular"
                      />
                    )}
                    <Text style={styles.typeText}>{sessionTag}</Text>
                  </View>
                )}
                <View style={styles.ballBadge}>
                  <BoulesIcon size={16} color={colors.neutrals.white} />
                  <Text style={styles.ballText}>{totalBalls}</Text>
                </View>
              </View>

              {selectedDelivery && !selectedDelivery.isHighlight && (
                <TouchableOpacity
                  style={styles.favButton}
                  onPress={() => toggleFavorite(selectedDelivery)}
                >
                  <HeartIcon
                    size={28}
                    color={
                      isFavorite(selectedDelivery)
                        ? colors.error[50]
                        : colors.neutrals.white
                    }
                    weight={isFavorite(selectedDelivery) ? 'fill' : 'regular'}
                  />
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.zoomButton}
                onPress={toggleVideoZoom}
              >
                {isVideoZoomed ? (
                  <MagnifyingGlassMinusIcon
                    size={24}
                    color={colors.neutrals.white}
                    weight="regular"
                  />
                ) : (
                  <MagnifyingGlassPlusIcon
                    size={24}
                    color={colors.neutrals.white}
                    weight="regular"
                  />
                )}
              </TouchableOpacity>

              {videoZoomLevel > MIN_VIDEO_SCALE && (
                <View style={styles.zoomLevelBadge} pointerEvents="none">
                  <Text style={styles.zoomLevelText}>
                    {formatZoomLevel(videoZoomLevel)}
                  </Text>
                </View>
              )}

              {/* Center: spinner while loading, play/pause icon once ready */}
              <View style={styles.centerControl} pointerEvents="box-none">
                {isVideoLoading ? (
                  <ActivityIndicator
                    size="large"
                    color={colors.neutrals.white}
                  />
                ) : !isPlaying ? (
                  <TouchableOpacity
                    style={styles.playCenter}
                    onPress={() => setIsPlaying(p => !p)}
                  >
                    <PlayIcon
                      size={32}
                      color={colors.neutrals.white}
                      weight="regular"
                    />
                  </TouchableOpacity>
                ) : null}
              </View>

              <View style={styles.bottomControls}>
                <View>
                  <Text style={styles.timeText}>
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.fullscreenButton}
                  onPress={() => {
                    const idx = deliveries.findIndex(
                      d => d.id === selectedDelivery?.id,
                    );
                    onFullscreen(
                      deliveries,
                      Math.max(0, idx),
                      currentPage,
                      totalPages,
                      sessionPlayers,
                    );
                  }}
                >
                  <CornersOutIcon size={28} color={colors.neutrals.white} />
                </TouchableOpacity>
              </View>

              <View style={styles.progressBarBg}>
                <View
                  style={[styles.progressBarFill, { width: `${progress}%` }]}
                />
                <View style={[styles.progressKnob, { left: `${progress}%` }]} />
              </View>
            </TouchableOpacity>
          </View>
        </GestureDetector>
      </View>

      {/* Fixed: all deliveries heading */}
      <Text style={styles.deliveriesHeader}>ALL DELIVERIES</Text>

      {/* Scrollable: clips only */}
      <FlatList
        data={deliveries.filter(item => !item.isHighlight)}
        extraData={favoritesVersion}
        numColumns={3}
        keyExtractor={item => `grid-${item.id}`}
        style={styles.deliveriesList}
        contentContainerStyle={styles.gridDeliveries}
        columnWrapperStyle={styles.gridRow}
        showsVerticalScrollIndicator={false}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isLoadingMore ? (
            <ActivityIndicator
              color={colors.primary.main}
              size="small"
              style={styles.loadingMoreSpinner}
            />
          ) : null
        }
        renderItem={({ item }) => (
          <DeliveryClipCard
            id={item.id}
            label={item.isHighlight ? 'HT' : String(item.ballNumber)}
            result={item.result}
            detail={item.detail}
            thumbnail={item.thumbnail as any}
            isSelected={selectedDelivery?.id === item.id}
            showHeart={!item.isHighlight}
            isFavorite={isFavorite(item)}
            isDownloading={isDownloading(item)}
            onPressFavorite={() => toggleFavorite(item)}
            onPress={() => {
              setSelectedDelivery(item);
              setIsPlaying(false);
              setIsVideoLoading(true);
              setProgress(0);
              setCurrentTime(0);
              resetVideoZoom();
            }}
          />
        )}
      />
    </SafeAreaView>
  );
};
