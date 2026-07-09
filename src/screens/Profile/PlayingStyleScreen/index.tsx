import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeftIcon } from 'phosphor-react-native';
import { colors } from '../../../theme/colors';
import { styles } from './styles';
import { useHeaderAnimation } from '../../../hooks/useHeaderAnimation';
import { Button } from '../../../components/common/Button';
import { SegmentedControl } from '../../../components/common/SegmentedControl';
import { Dropdown } from '../../../components/common/Dropdown';
import { onboardingService } from '../../../services/onboarding.service';

interface PlayingStyleScreenProps {
  initialData?: {
    role: string;
    batting_hand: string;
    batting_position: string;
    bowling_arm: string;
    bowling_style: string;
  };
  onBack: () => void;
  onSave: () => void;
}

export const PlayingStyleScreen: React.FC<PlayingStyleScreenProps> = ({
  initialData,
  onBack,
  onSave: onSaveProp,
}) => {
  const [loading, setLoading] = useState(!initialData);
  const [saving, setSaving] = useState(false);
  const [battingHand, setBattingHand] = useState<'left' | 'right'>(
    (initialData?.batting_hand as 'left' | 'right') || 'right',
  );
  const [battingPosition, setBattingPosition] = useState(
    initialData?.batting_position || '',
  );
  const [bowlingArm, setBowlingArm] = useState<'left' | 'right'>(
    (initialData?.bowling_arm as 'left' | 'right') || 'right',
  );
  const [bowlingStyle, setBowlingStyle] = useState(
    initialData?.bowling_style || '',
  );

  useEffect(() => {
    if (initialData) {
      setBattingHand((initialData.batting_hand as 'left' | 'right') || 'right');
      setBattingPosition(initialData.batting_position || '');
      setBowlingArm((initialData.bowling_arm as 'left' | 'right') || 'right');
      setBowlingStyle(initialData.bowling_style || '');
    }
    setLoading(false);
  }, [initialData]);

  const positionMap: Record<string, string> = {
    opener: 'Opener',
    top_order: 'Top Order',
    middle_order: 'Middle Order',
    lower_order: 'Lower Order',
    tail_ender: 'Tail Ender',
  };

  const bowlingStyleMap: Record<string, string> = {
    fast: 'Fast',
    medium_fast: 'Medium Fast',
    medium: 'Medium',
    off_break: 'Off Break',
    leg_break: 'Leg Break',
  };

  const getDisplayStyle = (fullStyle: string) => {
    if (!fullStyle) return '';
    const slug = fullStyle.replace(/^(left|right)_arm_/, '');
    return bowlingStyleMap[slug] || '';
  };

  const reverseMap = (map: Record<string, string>, val: string) =>
    Object.keys(map).find(key => map[key] === val) || val;

  const handleSave = async () => {
    try {
      setSaving(true);
      await onboardingService.updatePlayingStyle({
        batting_hand: battingHand,
        batting_position: battingPosition,
        bowling_arm: bowlingArm,
        bowling_style: bowlingStyle,
      });
      onSaveProp();
    } catch (error) {
      console.error('Failed to update playing style:', error);
      Alert.alert('Error', 'Failed to save profile changes');
    } finally {
      setSaving(false);
    }
  };

  const { headerStyle } = useHeaderAnimation();

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
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
        <Text style={styles.headerTitle}>Playing Style</Text>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.card}>
          <Animated.View entering={FadeInUp.delay(160).duration(380)}>
            <Text style={styles.sectionHeader}>BATTING</Text>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Batting Hand</Text>
              <SegmentedControl
                options={['Left Hand', 'Right Hand']}
                selectedIndex={battingHand === 'left' ? 0 : 1}
                onChange={idx => setBattingHand(idx === 0 ? 'left' : 'right')}
                style={styles.segmentedControl}
              />
            </View>
            <Dropdown
              label="Batting Position"
              placeholder="Select position"
              options={Object.values(positionMap)}
              selectedValue={positionMap[battingPosition] || ''}
              onSelect={val => setBattingPosition(reverseMap(positionMap, val))}
              style={styles.fieldGroup}
              triggerStyle={styles.dropdownTrigger}
            />
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(280).duration(380)}>
            <Text style={styles.sectionHeader}>BOWLING</Text>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Bowling Arm</Text>
              <SegmentedControl
                options={['Left Arm', 'Right Arm']}
                selectedIndex={bowlingArm === 'left' ? 0 : 1}
                onChange={idx => setBowlingArm(idx === 0 ? 'left' : 'right')}
                style={styles.segmentedControl}
              />
            </View>
            <Dropdown
              label="Bowling Style"
              placeholder="Select style"
              options={Object.values(bowlingStyleMap)}
              selectedValue={getDisplayStyle(bowlingStyle)}
              onSelect={val => {
                const slug = reverseMap(bowlingStyleMap, val);
                setBowlingStyle(`${bowlingArm}_arm_${slug}`);
              }}
              style={styles.fieldGroup}
              triggerStyle={styles.dropdownTrigger}
            />
          </Animated.View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label="SAVE"
          onPress={handleSave}
          variant="primary"
          loading={saving}
          disabled={saving || !battingPosition || !bowlingStyle}
        />
      </View>
    </SafeAreaView>
  );
};
