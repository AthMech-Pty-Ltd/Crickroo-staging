import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  StyleProp,
} from 'react-native';
import {
  CalendarBlankIcon,
  CaretDownIcon,
  CheckIcon,
  StackSimpleIcon,
  XIcon,
} from 'phosphor-react-native';
import {
  DashboardMode,
  dashboardService,
} from '../../../services/dashboard.service';
import { colors } from '../../../theme/colors';
import { styles } from './styles';

type PickerTab = 'summary' | 'single';

interface SessionFilterPickerProps {
  options: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
  style?: StyleProp<ViewStyle>;
  dashboardMode: DashboardMode;
  cricId?: string | null;
}

const SESSION_FILTER_MAP: Record<string, number> = {
  'Last Session': 1,
  'Last 2 Sessions': 2,
  'Last 3 Sessions': 3,
  'Last 5 Sessions': 5,
  'Last 10 Sessions': 10,
  'Last 15 Sessions': 15,
  'Last 20 Sessions': 20,
  'Last 25 Sessions': 25,
};

const formatMinutes = (mins?: number): string => {
  if (!mins || mins <= 0) return '0m';
  const total = Math.floor(mins);
  const h = Math.floor(total / 60);
  const m = total % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

export const SessionFilterPicker: React.FC<SessionFilterPickerProps> = ({
  options,
  selectedValue,
  onSelect,
  style,
  dashboardMode,
  cricId,
}) => {
  const [visible, setVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<PickerTab>('summary');
  const [summaryTimes, setSummaryTimes] = useState<Record<string, string>>({});
  const [summaryLoading, setSummaryLoading] = useState(false);

  useEffect(() => {
    if (!visible || activeTab !== 'summary') return;

    let cancelled = false;
    setSummaryLoading(true);

    (async () => {
      const entries = await Promise.all(
        options.map(async option => {
          try {
            const sessions = SESSION_FILTER_MAP[option];
            const response = await dashboardService.getDashboard({
              mode: dashboardMode,
              sessions,
              cric_id: cricId ?? undefined,
            });
            return [option, formatMinutes(response.total_time_minutes)] as const;
          } catch {
            return [option, ''] as const;
          }
        }),
      );

      if (!cancelled) {
        setSummaryTimes(Object.fromEntries(entries));
        setSummaryLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [activeTab, cricId, dashboardMode, options, visible]);

  const handleSelect = (value: string) => {
    onSelect(value);
    setVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.9}
        style={[styles.trigger, style]}
        onPress={() => {
          setActiveTab('summary');
          setVisible(true);
        }}
      >
        <View style={styles.triggerLeft}>
          <View style={styles.triggerTextWrap}>
            <Text style={styles.triggerTitle} numberOfLines={1}>
              {selectedValue}
            </Text>
          </View>
        </View>
        <CaretDownIcon size={16} color={colors.neutrals[50]} />
      </TouchableOpacity>

      <Modal
        transparent
        animationType="slide"
        visible={visible}
        statusBarTranslucent
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setVisible(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.handle} />
            <View style={styles.header}>
              <Text style={styles.title}>Select sessions</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setVisible(false)}
              >
                <XIcon size={16} color={colors.neutrals[85]} />
              </TouchableOpacity>
            </View>

            <View style={styles.tabs}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'summary' && styles.tabActive]}
                onPress={() => setActiveTab('summary')}
              >
                <StackSimpleIcon
                  size={16}
                  color={
                    activeTab === 'summary'
                      ? colors.neutrals.black
                      : colors.neutrals[50]
                  }
                />
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'summary' && styles.tabTextActive,
                  ]}
                >
                  Summary
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'single' && styles.tabActive]}
                onPress={() => setActiveTab('single')}
              >
                <CalendarBlankIcon
                  size={16}
                  color={
                    activeTab === 'single'
                      ? colors.neutrals.black
                      : colors.neutrals[50]
                  }
                />
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'single' && styles.tabTextActive,
                  ]}
                >
                  Single session
                </Text>
              </TouchableOpacity>
            </View>

            {activeTab === 'summary' ? (
              <>
                <Text style={styles.helperText}>
                  Aggregated stats across a range of recent sessions.
                </Text>
                {summaryLoading ? (
                  <View style={styles.loadingRow}>
                    <ActivityIndicator
                      size="small"
                      color={colors.primary.main}
                    />
                  </View>
                ) : null}
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.listContent}
                >
                  {options.map(option => {
                    const isSelected = option === selectedValue;
                    return (
                      <TouchableOpacity
                        key={option}
                        style={[
                          styles.optionCard,
                          isSelected && styles.optionCardSelected,
                        ]}
                        activeOpacity={0.9}
                        onPress={() => handleSelect(option)}
                      >
                        <View style={styles.optionLeft}>
                          <View
                            style={[
                              styles.optionIcon,
                              isSelected && styles.optionIconSelected,
                            ]}
                          >
                            <StackSimpleIcon
                              size={18}
                              color={
                                isSelected
                                  ? colors.neutrals.white
                                  : colors.neutrals[60]
                              }
                            />
                          </View>
                          <View style={styles.optionTextWrap}>
                            <View style={styles.optionTitleRow}>
                              <Text style={styles.optionTitle}>{option}</Text>
                              {summaryTimes[option] ? (
                                <Text style={styles.optionTimeText}>
                                  {summaryTimes[option]}
                                </Text>
                              ) : null}
                            </View>
                          </View>
                        </View>
                        {isSelected ? (
                          <CheckIcon size={18} color={colors.primary.main} />
                        ) : null}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </>
            ) : (
              <>
                <Text style={styles.helperText}>
                  Single-session stats need a session-specific dashboard API.
                </Text>
                <View style={[styles.optionCard, styles.optionCardDisabled]}>
                  <View style={styles.optionLeft}>
                    <View style={styles.optionIcon}>
                      <CalendarBlankIcon
                        size={18}
                        color={colors.neutrals[60]}
                      />
                    </View>
                    <View style={styles.optionTextWrap}>
                      <Text style={styles.optionTitle}>Single session</Text>
                      <Text style={styles.optionMetaText}>
                        UI is ready. Data wiring can be added when backend support
                        is available.
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.singleSessionCard}>
                  <Text style={styles.singleSessionTitle}>
                    Current support
                  </Text>
                  <Text style={styles.singleSessionText}>
                    The dashboard currently supports summary filters like last 5,
                    10, or all sessions. Once the API accepts a specific
                    session, this tab can show the exact list from your
                    reference.
                  </Text>
                </View>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};
