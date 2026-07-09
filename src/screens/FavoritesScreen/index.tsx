import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  Platform,
  Share,
  ToastAndroid,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import RNFS from 'react-native-fs';
import Video from 'react-native-video';
import { HeartIcon, PlayIcon, ArrowLeftIcon } from 'phosphor-react-native';
import { DeliveryClipCard } from '../../components/highlights/DeliveryClipCard';
import { FavoriteClip } from '../../types/favorites';
import { ASSETS } from '../../constants/assets';
import { colors } from '../../theme/colors';
import { styles } from './styles';

type SectionHeader = { type: 'header'; key: string; label: string };
type ClipRow = { type: 'row'; key: string; clips: FavoriteClip[] };
type ListItem = SectionHeader | ClipRow;

export function favClipKey(clip: FavoriteClip): string {
  return `${clip.sessionId}_${clip.ballNumber}`;
}

function formatSessionDate(ts: number): string {
  const d = new Date(ts);
  const day = d.toLocaleString('en-US', { weekday: 'short' });
  const month = d.toLocaleString('en-US', { month: 'short' });
  return `${day}, ${d.getDate()} ${month}`;
}

function formatTime(seconds: number): string {
  if (!seconds || seconds < 0 || !isFinite(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function buildListData(favorites: FavoriteClip[]): ListItem[] {
  const sorted = [...favorites].sort(
    (a, b) => (b.sessionDate ?? b.savedAt) - (a.sessionDate ?? a.savedAt),
  );

  const groupMap = new Map<string, FavoriteClip[]>();
  for (const clip of sorted) {
    const d = new Date(clip.sessionDate ?? clip.savedAt);
    const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    const label = `${month} ${d.getFullYear()}`;
    if (!groupMap.has(label)) groupMap.set(label, []);
    groupMap.get(label)!.push(clip);
  }

  const items: ListItem[] = [];
  for (const [label, clips] of groupMap) {
    items.push({ type: 'header', key: `header-${label}`, label });
    for (let i = 0; i < clips.length; i += 3) {
      items.push({
        type: 'row',
        key: `row-${label}-${i}`,
        clips: clips.slice(i, i + 3),
      });
    }
  }
  return items;
}

export async function downloadClipsToDevice(
  clips: FavoriteClip[],
): Promise<void> {
  const validClips = clips.filter(c => c.localVideoPath);

  if (Platform.OS === 'android') {
    const destDir = `${RNFS.DownloadDirectoryPath}/Crickroo`;
    await RNFS.mkdir(destDir);

    for (const clip of validClips) {
      const src = clip.localVideoPath.replace('file://', '');
      const filename = `${clip.sessionName}_ball${clip.ballNumber}.mp4`.replace(
        /[^a-zA-Z0-9._-]/g,
        '_',
      );
      const dest = `${destDir}/${filename}`;
      await RNFS.copyFile(src, dest);
      await RNFS.scanFile(dest);
    }

    ToastAndroid.show(
      `${validClips.length} clip${
        validClips.length > 1 ? 's' : ''
      } saved to Downloads/Crickroo`,
      ToastAndroid.LONG,
    );
  } else {
    for (const clip of validClips) {
      await Share.share({ url: clip.localVideoPath });
    }
  }
}

interface FavoritesScreenProps {
  clips: FavoriteClip[];
  selectionMode?: boolean;
  selectedKeys?: Set<string>;
  onLongPressClip?: (key: string) => void;
  onPressClip?: (key: string) => void;
  onEndReached?: () => void;
  isLoadingMore?: boolean;
  isLoading?: boolean;
}

export const FavoritesScreen: React.FC<FavoritesScreenProps> = ({
  clips,
  selectionMode = false,
  selectedKeys = new Set(),
  onLongPressClip,
  onPressClip,
  onEndReached,
  isLoadingMore = false,
  isLoading = false,
}) => {
  const [selectedClip, setSelectedClip] = useState<FavoriteClip | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const listData = useMemo(() => buildListData(clips), [clips]);

  const videoHeader = selectedClip ? (
    <View style={styles.fixedSection}>
      <View style={styles.videoCard}>
        {selectedClip.localVideoPath ? (
          <Video
            source={{ uri: selectedClip.localVideoPath }}
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
              const pct = (data.currentTime / total) * 100;
              setProgress(isNaN(pct) ? 0 : pct);
            }}
            onEnd={() => {
              setIsPlaying(false);
              setProgress(100);
              setCurrentTime(duration);
            }}
          />
        ) : (
          <Image
            source={
              selectedClip.localThumbnailPath
                ? { uri: selectedClip.localThumbnailPath }
                : ASSETS.IMAGES.ONBOARDING_1
            }
            style={styles.videoThumbnail}
            resizeMode="cover"
          />
        )}

        <TouchableOpacity
          style={styles.videoOverlay}
          activeOpacity={1}
          onPress={() => {
            if (!isVideoLoading) setIsPlaying(p => !p);
          }}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              setSelectedClip(null);
              setIsPlaying(false);
            }}
          >
            <ArrowLeftIcon size={20} color={colors.neutrals.white} />
          </TouchableOpacity>

          <View style={styles.centerControl} pointerEvents="box-none">
            {isVideoLoading ? (
              <ActivityIndicator size="large" color={colors.neutrals.white} />
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
            <Text style={styles.timeText}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </Text>
          </View>

          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  ) : null;

  if (isLoading && clips.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
        </View>
      </View>
    );
  }

  if (clips.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconWrapper}>
            <HeartIcon size={56} color={colors.primary.main} weight="regular" />
          </View>
          <Text style={styles.emptyTitle}>
            Your favourite sessions will{'\n'}appear here
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {videoHeader}
      <FlatList
        data={listData}
        keyExtractor={item => item.key}
        style={styles.list}
        contentContainerStyle={[
          styles.listContent,
          !!selectedClip && styles.listContentNoPaddingTop,
        ]}
        showsVerticalScrollIndicator={false}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          isLoadingMore ? (
            <View style={styles.loadingMoreContainer}>
              <ActivityIndicator size="small" color={colors.primary.main} />
            </View>
          ) : null
        }
        renderItem={({ item }) => {
          if (item.type === 'header') {
            return <Text style={styles.sectionLabel}>{item.label}</Text>;
          }

          return (
            <View style={styles.gridRow}>
              {item.clips.map(clip => {
                const key = favClipKey(clip);
                const isSelected = selectedClip
                  ? favClipKey(selectedClip) === key
                  : false;
                return (
                  <DeliveryClipCard
                    key={key}
                    id={clip.ballNumber}
                    label={clip.isHighlight ? 'HT' : String(clip.ballNumber)}
                    result={`${clip.sessionName}, ${formatSessionDate(
                      clip.sessionDate ?? clip.savedAt,
                    )}`}
                    detail={clip.result}
                    thumbnail={
                      clip.localThumbnailPath
                        ? { uri: clip.localThumbnailPath }
                        : ASSETS.IMAGES.ONBOARDING_1
                    }
                    showBadge={false}
                    showHeart={false}
                    isSelected={!selectionMode && isSelected}
                    selectionMode={selectionMode}
                    isChecked={selectedKeys.has(key)}
                    onPress={() => {
                      setSelectedClip(clip);
                      setIsPlaying(false);
                      setIsVideoLoading(!!clip.localVideoPath);
                      setProgress(0);
                      setCurrentTime(0);
                      setDuration(0);

                      if (selectionMode) {
                        onPressClip?.(key);
                      }
                    }}
                    onLongPress={() => onLongPressClip?.(key)}
                  />
                );
              })}
              {item.clips.length < 3 &&
                Array.from({ length: 3 - item.clips.length }).map((_, i) => (
                  <View key={`spacer-${i}`} style={styles.cardSpacer} />
                ))}
            </View>
          );
        }}
      />
    </View>
  );
};
