import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
// Previous inline date picker imports kept for reference:
// import { ScrollView, useWindowDimensions } from 'react-native';
import { MonitorPlayIcon, FadersHorizontalIcon } from 'phosphor-react-native';
import { colors } from '../../../theme/colors';
import { styles } from './styles';
import { Button } from '../../../components/common/Button';
import { Dropdown } from '../../../components/common/Dropdown';
import { HighlightCard } from '../../../components/highlights/HighlightCard';
import { HighlightSession, Session } from '../../../types';
import { AppMode } from '../../../types/auth';
import { AcademyPlayer } from '../../../types/academy';
import { sessionService } from '../../../services/session.service';
import { academyService } from '../../../services/academy.service';
import { formatDuration } from '../../../utils/date';
import { ASSETS } from '../../../constants/assets';
import CalendarPicker from './CalendarPicker';
import { storage } from '../../../utils/storage';

const MY_SESSIONS = 'My Sessions';
const ALL_PLAYERS = 'All Players';

// Previous inline date picker code kept for reference:
// const DAY_ABBREVS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
// const MONTH_ABBREVS = [
//   'JAN',
//   'FEB',
//   'MAR',
//   'APR',
//   'MAY',
//   'JUN',
//   'JUL',
//   'AUG',
//   'SEP',
//   'OCT',
//   'NOV',
//   'DEC',
// ];
//
// // Today is the last item — 14 past days shown before it
// const PAST_DAYS = 14;
//
// interface DateItem {
//   date: Date;
//   key: string;
// }
//
// function generateDates(): DateItem[] {
//   const today = new Date();
//   today.setHours(0, 0, 0, 0);
//   const items: DateItem[] = [];
//   for (let i = -PAST_DAYS; i <= 0; i++) {
//     const d = new Date(today);
//     d.setDate(today.getDate() + i);
//     items.push({
//       date: d,
//       key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
//         2,
//         '0',
//       )}-${String(d.getDate()).padStart(2, '0')}`,
//     });
//   }
//   return items;
// }

const toDateStr = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    '0',
  )}-${String(date.getDate()).padStart(2, '0')}`;

const parseDateStr = (dateStr: string) => {
  const dateOnly = dateStr.slice(0, 10);
  const [year, month, date] = dateOnly.split('-').map(Number);
  if (!year || !month || !date) return null;

  const parsed = new Date(year, month - 1, date);
  parsed.setHours(0, 0, 0, 0);
  return isNaN(parsed.getTime()) ? null : parsed;
};

function mapSessions(data: Session[]): HighlightSession[] {
  return data.map(session => ({
    sessionId: session.sessionId,
    sessionNumber: session.sessionNumber,
    title: session.sessionName,
    subtitle: session.mode.charAt(0).toUpperCase() + session.mode.slice(1),
    mode: session.mode,
    sessionType: session.sessionType,
    type:
      session.sessionType === 'group'
        ? `Group of ${session.numberOfPlayers + 1}`
        : 'Solo',
    duration: formatDuration(session.createdAt, session.endedAt),
    balls: session.totalBalls ?? 0,
    thumbnail: session.sessionThumbnailUrl
      ? { uri: session.sessionThumbnailUrl }
      : ASSETS.IMAGES.ONBOARDING_1,
    isFavorite: false,
  }));
}

// Previous inline date picker helper kept for reference:
// function isSameDay(a: Date, b: Date) {
//   return (
//     a.getFullYear() === b.getFullYear() &&
//     a.getMonth() === b.getMonth() &&
//     a.getDate() === b.getDate()
//   );
// }

interface HighlightsScreenProps {
  onOpenPlayback?: (
    id: string,
    name: string,
    date: number,
    tag: string,
    sessionNumber: number,
    mode: string,
    sessionType: string,
  ) => void;
  onCreateSession?: () => void;
  staticMode?: boolean;
  isActive?: boolean;
  sessionMode?: AppMode;
  academyId?: string;
}

// Previous inline date picker layout constants kept for reference:
// const DATE_ITEM_WIDTH = 48;
// const DIVIDER_WIDTH = 32;
// const ITEM_GAP = 12;
// const BAR_PADDING = 12;
//
// /** Returns the x offset to scroll to so the item at `index` is centered. */
// function getScrollOffset(
//   dateItems: DateItem[],
//   index: number,
//   screenWidth: number,
// ): number {
//   let x = BAR_PADDING;
//   let prevMonth: number | null = null;
//   for (let i = 0; i < dateItems.length; i++) {
//     const month = dateItems[i].date.getMonth();
//     if (prevMonth !== null && month !== prevMonth) {
//       x += DIVIDER_WIDTH + ITEM_GAP;
//     }
//     if (i === index) break;
//     x += DATE_ITEM_WIDTH + ITEM_GAP;
//     prevMonth = month;
//   }
//   // Center the item in the viewport
//   return Math.max(0, x - screenWidth / 2 + DATE_ITEM_WIDTH / 2);
// }

export const HighlightsScreen: React.FC<HighlightsScreenProps> = ({
  onOpenPlayback,
  onCreateSession,
  staticMode = false,
  isActive = true,
  sessionMode,
  academyId,
}) => {
  // Previous inline date picker screen width:
  // const { width: screenWidth } = useWindowDimensions();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isCoach = sessionMode === 'coach';
  const currentSessionMode: AppMode = sessionMode ?? 'player';

  // Coach mode: players assigned to batches under this coach's academy,
  // used to filter the highlights list (filtering itself is pending the
  // sessions API update — this only wires up the selector for now).
  const [players, setPlayers] = useState<AcademyPlayer[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<string>(MY_SESSIONS);

  // Keep the latest selection accessible to the activation effect (which only
  // re-runs on isActive/sessionMode change, not on every player change).
  const selectedPlayerRef = useRef(selectedPlayer);
  selectedPlayerRef.current = selectedPlayer;

  // Maps the dropdown selection to the `getSessions` scope/player filter.
  // Coach-only — in player mode no scope is sent (the API returns own sessions).
  const buildSessionFilter = useCallback(
    (player: string) => {
      if (!isCoach) return undefined;
      if (player === MY_SESSIONS) return { scope: 'own' as const };
      if (player === ALL_PLAYERS) return { scope: 'students' as const };
      const match = players.find(p => p.name === player);
      return match ? { playerCricId: match.cric_id } : undefined;
    },
    [isCoach, players],
  );

  const resolveSessionMode = useCallback(
    (_player: string): AppMode | undefined => {
      // Do not send session_mode here.
      // Players must see their own sessions plus coach-created sessions where
      // they are listed in session_players. Coaches use scope/player filters.
      return undefined;
    },
    [],
  );

  useEffect(() => {
    if (staticMode || !isActive || !isCoach || !academyId) return;
    let cancelled = false;
    academyService
      .getAcademyPlayers(academyId)
      .then(fetchedPlayers => {
        if (!cancelled) setPlayers(fetchedPlayers);
      })
      .catch(err => console.warn('Failed to fetch academy players:', err));
    return () => {
      cancelled = true;
    };
  }, [staticMode, isActive, isCoach, academyId]);

  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [userId, setUserId] = useState<string | null>(null);
  const [sessionDates, setSessionDates] = useState<string[]>([]);
  const [sessions, setSessions] = useState<HighlightSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const skipNextFetchRef = useRef(false);
  // Previous inline date picker refs/data kept for reference:
  // const dateScrollRef = useRef<ScrollView>(null);
  // const dateItems = generateDates();
  //
  // const scrollToDate = useCallback(
  //   (date: Date) => {
  //     const index = dateItems.findIndex(item => isSameDay(item.date, date));
  //     if (index === -1) return;
  //     // Last item → snap to end; otherwise center the item
  //     if (index === dateItems.length - 1) {
  //       dateScrollRef.current?.scrollToEnd({ animated: false });
  //     } else {
  //       dateScrollRef.current?.scrollTo({
  //         x: getScrollOffset(dateItems, index, screenWidth),
  //         animated: false,
  //       });
  //     }
  //     // eslint-disable-next-line react-hooks/exhaustive-deps
  //   },
  //   [screenWidth, dateItems],
  // );

  useEffect(() => {
    if (staticMode) return;

    let cancelled = false;
    storage.getUser().then(user => {
      if (!cancelled) setUserId(user?.id ?? null);
    });

    return () => {
      cancelled = true;
    };
  }, [staticMode]);

  useEffect(() => {
    if (staticMode || !isActive || !userId) return;

    setSessionDates([]);

    let cancelled = false;
    sessionService
      .getSessionDatesByUser(
        userId,
        resolveSessionMode(selectedPlayer),
        buildSessionFilter(selectedPlayer),
      )
      .then(dates => {
        if (!cancelled) setSessionDates(dates);
      })
      .catch(err => {
        console.warn('Failed to fetch session dates:', err);
        if (!cancelled) setSessionDates([]);
      });

    return () => {
      cancelled = true;
    };
  }, [
    staticMode,
    isActive,
    userId,
    currentSessionMode,
    selectedPlayer,
    buildSessionFilter,
    resolveSessionMode,
  ]);

  // Re-run whenever the tab becomes active
  useEffect(() => {
    if (staticMode || !isActive || !userId) return;

    setSelectedDate(today);
    setSessions([]);
    setIsLoading(true);
    setIsInitializing(true);

    let cancelled = false;

    const initWithLatestDate = async () => {
      let targetDate = today;

      try {
        const selected = selectedPlayerRef.current;
        const filter = buildSessionFilter(selected);
        const recentDateStr = await sessionService.getRecentSessionDateByUser(
          userId,
          resolveSessionMode(selected),
          filter,
        );
        const parsed = recentDateStr ? parseDateStr(recentDateStr) : null;
        if (parsed) targetDate = parsed;
      } catch {
        // fall back to today if api fails
      }

      if (cancelled) return;

      try {
        const selected = selectedPlayerRef.current;
        const filter = buildSessionFilter(selected);
        const data: Session[] = await sessionService.getSessions(
          toDateStr(targetDate),
          resolveSessionMode(selected),
          filter,
        );
        if (!cancelled) {
          setSelectedDate(targetDate);
          setSessions(mapSessions(data));
          setIsLoading(false);
        }
      } catch {
        if (!cancelled) setIsLoading(false);
      }

      skipNextFetchRef.current = true;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!cancelled) setIsInitializing(false);
        });
      });
    };

    initWithLatestDate();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, staticMode, sessionMode, userId, currentSessionMode]);

  const fetchSessions = useCallback(
    async (date: Date) => {
      try {
        setIsLoading(true);
        const filter = buildSessionFilter(selectedPlayer);

        const data: Session[] = await sessionService.getSessions(
          toDateStr(date),
          resolveSessionMode(selectedPlayer),
          filter,
        );
        const mappedSessions = mapSessions(data);
        setSessions(mappedSessions);
        setError(null);
      } catch (err) {
        console.error('Error fetching highlights sessions:', err);
        setError('Failed to load sessions');
      } finally {
        setIsLoading(false);
      }
    },
    [selectedPlayer, buildSessionFilter, resolveSessionMode],
  );

  // Fetch sessions whenever selectedDate changes after initialization
  useEffect(() => {
    if (staticMode) return;
    if (isInitializing) return;
    if (skipNextFetchRef.current) {
      skipNextFetchRef.current = false;
      return;
    }
    fetchSessions(selectedDate);
  }, [selectedDate, isInitializing, fetchSessions, staticMode]);

  // Previous inline date picker component kept for reference.
  // CalendarPicker below is the active date picker.
  //
  // const renderDateBar = () => {
  //   let prevMonth: number | null = null;
  //
  //   return (
  //     <View style={styles.dateBarWrapper}>
  //       <ScrollView
  //         ref={dateScrollRef}
  //         horizontal
  //         showsHorizontalScrollIndicator={false}
  //         contentContainerStyle={styles.dateBarContent}
  //         onContentSizeChange={() => scrollToDate(selectedDate)}
  //       >
  //         {dateItems.map(item => {
  //           const isSelected =
  //             !isInitializing && isSameDay(item.date, selectedDate);
  //           const month = item.date.getMonth();
  //           const showMonthDivider = prevMonth !== null && month !== prevMonth;
  //           const dividerMonth = prevMonth;
  //           prevMonth = month;
  //
  //           return (
  //             <React.Fragment key={item.key}>
  //               {showMonthDivider && dividerMonth !== null && (
  //                 <View style={styles.monthDivider}>
  //                   <Text style={styles.monthDividerText}>
  //                     {MONTH_ABBREVS[dividerMonth]}
  //                   </Text>
  //                 </View>
  //               )}
  //               <TouchableOpacity
  //                 style={[
  //                   styles.dateItem,
  //                   isSelected && styles.dateItemSelected,
  //                 ]}
  //                 onPress={() => setSelectedDate(item.date)}
  //                 activeOpacity={0.7}
  //               >
  //                 <Text
  //                   numberOfLines={1}
  //                   style={[
  //                     styles.dateDayText,
  //                     isSelected && styles.dateDayTextSelected,
  //                   ]}
  //                 >
  //                   {DAY_ABBREVS[item.date.getDay()]}
  //                 </Text>
  //                 <Text
  //                   style={[
  //                     styles.dateNumText,
  //                     isSelected && styles.dateNumTextSelected,
  //                   ]}
  //                 >
  //                   {item.date.getDate()}
  //                 </Text>
  //               </TouchableOpacity>
  //             </React.Fragment>
  //           );
  //         })}
  //         {prevMonth !== null && (
  //           <View style={styles.monthDivider}>
  //             <Text style={styles.monthDividerText}>
  //               {MONTH_ABBREVS[prevMonth]}
  //             </Text>
  //           </View>
  //         )}
  //       </ScrollView>
  //     </View>
  //   );
  // };

  const renderContent = () => {
    if (staticMode) {
      const placeholders: HighlightSession[] = [
        {
          sessionId: 's1',
          sessionNumber: 1,
          title: 'Morning Session',
          subtitle: 'Batting',
          mode: 'batting',
          type: 'Solo',
          balls: 45,
          duration: '25m',
          isFavorite: false,
          thumbnail: ASSETS.IMAGES.ONBOARDING_1,
        },
        {
          sessionId: 's2',
          sessionNumber: 2,
          title: 'Evening Session',
          subtitle: 'Bowling',
          mode: 'bowling',
          type: 'Solo',
          balls: 30,
          duration: '18m',
          isFavorite: false,
          thumbnail: ASSETS.IMAGES.ONBOARDING_1,
        },
        {
          sessionId: 's3',
          sessionNumber: 3,
          title: 'Group Practice',
          subtitle: 'Batting',
          mode: 'batting',
          type: 'Group of 3',
          balls: 60,
          duration: '35m',
          isFavorite: false,
          thumbnail: ASSETS.IMAGES.ONBOARDING_1,
        },
        {
          sessionId: 's4',
          sessionNumber: 4,
          title: 'Net Session',
          subtitle: 'Bowling',
          mode: 'bowling',
          type: 'Solo',
          balls: 24,
          duration: '15m',
          isFavorite: false,
          thumbnail: ASSETS.IMAGES.ONBOARDING_1,
        },
        {
          sessionId: 's5',
          sessionNumber: 5,
          title: 'Academy Session',
          subtitle: 'Batting',
          mode: 'batting',
          type: 'Solo',
          balls: 52,
          duration: '30m',
          isFavorite: false,
          thumbnail: ASSETS.IMAGES.ONBOARDING_1,
        },
        {
          sessionId: 's6',
          sessionNumber: 6,
          title: 'Match Practice',
          subtitle: 'Bowling',
          mode: 'bowling',
          type: 'Group of 2',
          balls: 38,
          duration: '22m',
          isFavorite: false,
          thumbnail: ASSETS.IMAGES.ONBOARDING_1,
        },
      ];
      return (
        <FlatList
          data={placeholders}
          keyExtractor={item => item.sessionId}
          numColumns={2}
          scrollEnabled={false}
          pointerEvents="none"
          contentContainerStyle={styles.staticListContent}
          columnWrapperStyle={styles.columnWrapper}
          renderItem={({ item }) => (
            <HighlightCard {...item} onPress={() => {}} />
          )}
        />
      );
    }

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
            onPress={() => fetchSessions(selectedDate)}
          >
            <Text style={styles.retryButtonText}>RETRY</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (sessions.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyCircle}>
            <MonitorPlayIcon size={72} color={colors.primary.main} />
          </View>
          <Text style={styles.emptyText}>
            No session for this date yet, Start creating new
          </Text>
          <Button
            label="CREATE SESSION"
            onPress={onCreateSession ?? (() => {})}
            variant="primary_dark"
            style={styles.createButton}
          />
        </View>
      );
    }

    return (
      <>
        {!isCoach && (
          <Text style={styles.sessionsHeader}>
            TOTAL {sessions.length} SESSIONS
          </Text>
        )}
        <FlatList
          data={sessions}
          keyExtractor={item => item.sessionId}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          renderItem={({ item }) => (
            <HighlightCard
              {...item}
              onPress={() =>
                onOpenPlayback?.(
                  item.sessionId,
                  item.title,
                  selectedDate.getTime(),
                  item.type,
                  item.sessionNumber,
                  item.mode,
                  item.sessionType ?? 'solo',
                )
              }
            />
          )}
        />
      </>
    );
  };

  return (
    <View style={styles.container}>
      {/* Previous inline date picker call:
      {!staticMode && renderDateBar()} */}
      <CalendarPicker
        selectedDate={selectedDate}
        sessionDates={sessionDates}
        onDateSelect={setSelectedDate}
      />
      {!staticMode && isCoach && (
        <>
          <Text style={styles.sessionsHeader}>
            TOTAL {sessions.length} SESSIONS
            {selectedPlayer === ALL_PLAYERS &&
              ` FROM ${players.length} PLAYERS`}
          </Text>
          <Dropdown
            options={[MY_SESSIONS, ALL_PLAYERS, ...players.map(p => p.name)]}
            selectedValue={selectedPlayer}
            onSelect={setSelectedPlayer}
            leftIcon={
              <FadersHorizontalIcon size={20} color={colors.neutrals[60]} />
            }
            style={styles.playerFilter}
            triggerStyle={styles.playerFilterTrigger}
          />
        </>
      )}
      {renderContent()}
    </View>
  );
};
