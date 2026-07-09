import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
  RefreshControl,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeftIcon,
  VideoIcon,
  PlayIcon,
  BellSimpleIcon,
} from 'phosphor-react-native';
import { colors } from '../../../theme/colors';
import { useHeaderAnimation } from '../../../hooks/useHeaderAnimation';
import {
  getNotifications,
  AppNotification,
} from '../../../services/notifications.service';
import { styles } from './styles';

interface NotificationsScreenProps {
  onBack: () => void;
  onOpenSessionHighlights: (
    sessionId: string,
    sessionNumber: number | null,
  ) => void;
}

interface NotificationSection {
  title: string;
  data: AppNotification[];
}

const formatTimeAgo = (dateString: string) => {
  try {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '';
  }
};

const getSectionTitle = (dateString: string) => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffInDays = Math.round(
    (today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';

  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year:
      date.getFullYear() === now.getFullYear() ? undefined : 'numeric',
  });
};

const buildSections = (items: AppNotification[]): NotificationSection[] => {
  const sortedItems = [...items].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
  const groupedItems = new Map<string, AppNotification[]>();

  sortedItems.forEach(item => {
    const title = getSectionTitle(item.created_at);
    const existingItems = groupedItems.get(title) || [];
    existingItems.push(item);
    groupedItems.set(title, existingItems);
  });

  return Array.from(groupedItems.entries()).map(([title, data]) => ({
    title,
    data,
  }));
};

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({
  onBack,
  onOpenSessionHighlights,
}) => {
  const { headerStyle } = useHeaderAnimation();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const sections = buildSections(notifications);

  const fetchNotifications = useCallback(
    async (pageNum: number, refresh = false) => {
      try {
        const response = await getNotifications(pageNum, 20);
        const fetched = response.notifications || [];

        if (refresh) {
          setNotifications(fetched);
        } else {
          setNotifications(prev => [...prev, ...fetched]);
        }

        setHasMore(fetched.length === 20);
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
        Alert.alert('Error', 'Failed to load notifications. Please try again.');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
        setIsLoadingMore(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchNotifications(1, true);
  }, [fetchNotifications]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setPage(1);
    fetchNotifications(1, true);
  };

  const handleLoadMore = () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    fetchNotifications(nextPage, false);
  };

  const handleNotificationPress = async (item: AppNotification) => {
    if (item.type === 'session_highlights_ready') {
      if (item.session_id) {
        onOpenSessionHighlights(item.session_id, item.session_number);
      }
    } else if (item.type === 'highlight_ready') {
      if (item.download_url) {
        try {
          await Linking.openURL(item.download_url);
        } catch {
          Alert.alert('Error', 'Unable to open the highlight video url.');
        }
      } else {
        Alert.alert('Highlight Reel', 'Download link is no longer available.');
      }
    }
  };

  const renderItem = ({ item }: { item: AppNotification }) => {
    const isHighlightReady = item.type === 'highlight_ready';
    const title = isHighlightReady
      ? 'Your custom highlight is ready! 🎬'
      : item.title || 'Session highlights ready 🎉';
    const body = isHighlightReady
      ? `Reel #${item.generation_number ?? 0} finished generating.`
      : item.body || 'Tap to view the clips from your latest session.';

    return (
      <TouchableOpacity
        style={styles.notificationCard}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.iconContainer}>
          {isHighlightReady ? (
            <PlayIcon size={20} color={colors.primary.main} weight="fill" />
          ) : (
            <VideoIcon size={20} color={colors.primary.main} weight="fill" />
          )}
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.titleText}>{title}</Text>
          <Text style={styles.bodyText}>{body}</Text>
          <Text style={styles.timeText}>{formatTimeAgo(item.created_at)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading && page === 1) {
    return (
      <SafeAreaView style={styles.container}>
        <Animated.View style={[styles.header, headerStyle]}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <ArrowLeftIcon size={24} color={colors.neutrals.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
        </Animated.View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={colors.primary.main} size="large" />
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
        <Text style={styles.headerTitle}>Notifications</Text>
      </Animated.View>

      <SectionList
        sections={sections}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>{section.title}</Text>
          </View>
        )}
        contentContainerStyle={
          notifications.length === 0 ? { flex: 1 } : styles.listContent
        }
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary.main}
            colors={[colors.primary.main]}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          isLoadingMore ? (
            <View style={styles.loadingMore}>
              <ActivityIndicator color={colors.primary.main} size="small" />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <BellSimpleIcon size={64} color={colors.neutrals[40]} />
            <Text style={styles.emptyTitle}>All Caught Up</Text>
            <Text style={styles.emptySubtitle}>
              You don't have any notifications yet.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};
