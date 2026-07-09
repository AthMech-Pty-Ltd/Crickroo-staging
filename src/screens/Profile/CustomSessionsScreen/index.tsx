import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeftIcon,
  BellSimpleIcon,
  DownloadSimpleIcon,
} from 'phosphor-react-native';
import { colors } from '../../../theme/colors';
import { useHeaderAnimation } from '../../../hooks/useHeaderAnimation';
import {
  AppNotification,
  getNotifications,
} from '../../../services/notifications.service';
import { downloadAndSaveHighlight } from '../../../services/highlightDownload.service';
import { styles } from './styles';

interface CustomSessionsScreenProps {
  onBack: () => void;
}

interface CustomHighlightItem {
  id: string;
  reelNumber: number;
  createdAt: string;
  downloadUrl: string | null;
  s3Key: string | null;
}

interface CustomHighlightSection {
  title: string;
  data: CustomHighlightItem[];
}

const isNoSpaceLeftError = (error: unknown) => {
  const message =
    error instanceof Error ? error.message : String(error ?? '');
  return /no space left on device/i.test(message);
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

const buildSections = (
  items: CustomHighlightItem[],
): CustomHighlightSection[] => {
  const sortedItems = [...items].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const groupedItems = new Map<string, CustomHighlightItem[]>();

  sortedItems.forEach(item => {
    const title = getSectionTitle(item.createdAt);
    const existingItems = groupedItems.get(title) || [];
    existingItems.push(item);
    groupedItems.set(title, existingItems);
  });

  return Array.from(groupedItems.entries()).map(([title, data]) => ({
    title,
    data,
  }));
};

export const CustomSessionsScreen: React.FC<CustomSessionsScreenProps> = ({
  onBack,
}) => {
  const { headerStyle } = useHeaderAnimation();
  const [customHighlights, setCustomHighlights] = useState<CustomHighlightItem[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const customHighlightSections = buildSections(customHighlights);

  const fetchCustomHighlights = useCallback(async (refresh = false) => {
    try {
      const response = await getNotifications(1, 100, 'highlight_ready');
      const highlights = (response.notifications || [])
        .filter((item: AppNotification) => item.type === 'highlight_ready')
        .map((item: AppNotification) => ({
          id: item.id,
          reelNumber: item.generation_number ?? 0,
          createdAt: item.created_at,
          downloadUrl: item.download_url,
          s3Key: item.s3_key,
        }));

      setCustomHighlights(highlights);
    } catch (err) {
      console.error('Failed to fetch customised sessions:', err);
      Alert.alert(
        'Error',
        'Failed to load customised sessions. Please try again.',
      );
    } finally {
      setIsLoading(false);
      if (refresh) {
        setIsRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchCustomHighlights();
  }, [fetchCustomHighlights]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchCustomHighlights(true);
  };

  const handleDownload = async (item: CustomHighlightItem) => {
    if (!item.downloadUrl || !item.s3Key) {
      Alert.alert('Download', 'Download link is no longer available.');
      return;
    }

    try {
      await downloadAndSaveHighlight(item.downloadUrl, item.s3Key);
    } catch (error) {
      console.error('Failed to download custom session:', error);
      if (isNoSpaceLeftError(error)) {
        Alert.alert(
          'Storage Full',
          'The simulator is out of storage space. Free some space or reset the simulator, then try downloading again.',
        );
        return;
      }

      Alert.alert('Error', 'Unable to download the video.');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Animated.View style={[styles.header, headerStyle]}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <ArrowLeftIcon size={24} color={colors.neutrals.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>customised highlights
          </Text>
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
        <Text style={styles.headerTitle}>Customised Sessions</Text>
      </Animated.View>

      <SectionList
        sections={customHighlightSections}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          customHighlights.length === 0
            ? styles.emptyListContent
            : styles.listContent
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary.main}
            colors={[colors.primary.main]}
          />
        }
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>{section.title}</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styles.notificationCard}>
            <Text style={styles.titleText}>{`Reel ${item.reelNumber}`}</Text>
            <TouchableOpacity
              style={styles.downloadButton}
              activeOpacity={0.8}
              onPress={() => handleDownload(item)}
            >
              <DownloadSimpleIcon size={16} color={colors.neutrals.white} />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <BellSimpleIcon size={64} color={colors.neutrals[40]} />
            <Text style={styles.emptyTitle}>No Customised Sessions Yet</Text>
            <Text style={styles.emptySubtitle}>
              Your highlight reels will appear here when they are ready.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};
