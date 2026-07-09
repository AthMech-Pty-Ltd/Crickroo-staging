import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, NativeModules, Platform } from 'react-native';
import {
  UserIcon,
  UsersIcon,
  CricketIcon,
  BoulesIcon,
  PlusIcon,
} from 'phosphor-react-native';
import { BaseAuthLayout } from '../../../components/auth/BaseAuthLayout';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import {
  SegmentedControl,
  SegmentOption,
} from '../../../components/common/SegmentedControl';
import { CustomSlider } from '../../../components/common/CustomSlider';
import {
  SelectPlayerModal,
  PlayerOption,
} from '../../../components/session/SelectPlayerModal';
import { colors } from '../../../theme/colors';
import { sessionService } from '../../../services/session.service';
import {
  CreateSessionRequest,
  CreateSessionResponse,
} from '../../../types/session';
import { AppMode } from '../../../types/auth';
import { styles } from './styles';

const SESSION_TYPE_OPTIONS: SegmentOption[] = [
  { label: 'Solo', icon: color => <UserIcon size={20} color={color} /> },
  { label: 'Group', icon: color => <UsersIcon size={20} color={color} /> },
];

const MODE_OPTIONS: SegmentOption[] = [
  { label: 'Batting', icon: color => <CricketIcon size={20} color={color} /> },
  { label: 'Bowling', icon: color => <BoulesIcon size={20} color={color} /> },
];

interface CreateNewSessionScreenProps {
  onBack: () => void;
  forceGroup?: boolean;
  academyId?: string;
  // Whether the logged-in user is acting as a coach or a player.
  sessionMode: AppMode;
  onConfirm: (
    details: CreateSessionResponse,
    selectedPlayerCricIds: string[],
  ) => void;
}

export const CreateNewSessionScreen: React.FC<CreateNewSessionScreenProps> = ({
  onBack,
  forceGroup = false,
  academyId,
  sessionMode,
  onConfirm,
}) => {
  const [sessionName, setSessionName] = useState('');
  const [sessionTypeIndex, setSessionTypeIndex] = useState(forceGroup ? 1 : 0);
  const [modeIndex, setModeIndex] = useState(0);
  const [pitchLength, setPitchLength] = useState(22);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [players, setPlayers] = useState<PlayerOption[]>([]);
  const [showPlayerModal, setShowPlayerModal] = useState(false);

  const isGroup = forceGroup || sessionTypeIndex === 1;

  const handlePlayerSelected = (newPlayers: PlayerOption[]) => {
    setPlayers(prev => [...prev, ...newPlayers]);
  };

  const handleRemovePlayer = (index: number) => {
    setPlayers(players.filter((_, i) => i !== index));
  };

  const handleCreateSession = async () => {
    if (loading || !sessionName.trim()) return;

    setLoading(true);
    setError(null);

    try {
      if (Platform.OS === 'android') {
        const supported = await NativeModules.Camera2?.isRecordingSupported?.();
        if (!supported) {
          setError(
            'This device does not support the recording capability required by CrickRoo. Please try again on another device.',
          );
          setLoading(false);
          return;
        }
      }
    } catch {
      setError(
        'This device does not support the recording capability required by CrickRoo. Please try again on another device.',
      );
      setLoading(false);
      return;
    }

    const sessionData: CreateSessionRequest = {
      sessionName,
      sessionType: isGroup ? 'group' : 'solo',
      mode: modeIndex === 0 ? 'batting' : 'bowling',
      pitchLength,
      numberOfPlayers: isGroup ? players.length : 1,
      players: isGroup
        ? players.map(p => ({ name: p.name, playerId: p.id }))
        : [],
      sessionMode,
    };

    try {
      const response = await sessionService.createSession(sessionData);
      onConfirm(response, isGroup ? players.map(p => p.identifier) : []);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail?.[0]?.msg ||
          'Failed to create session. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseAuthLayout
      title="Create New Session"
      onBack={onBack}
      headerVariant="standard"
      footer={
        <Button
          label="CREATE SESSION"
          onPress={handleCreateSession}
          variant="primary"
          loading={loading}
          disabled={
            loading || !sessionName.trim() || (isGroup && players.length === 0)
          }
        />
      }
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {error && <Text style={styles.errorText}>{error}</Text>}
        <View style={styles.card}>
          <View style={styles.field}>
            <Text style={styles.label}>Session Name</Text>
            <Input
              value={sessionName}
              onChangeText={setSessionName}
              placeholder="Enter session name"
            />
          </View>

          {!forceGroup && (
            <View style={styles.field}>
              <Text style={styles.label}>Session Type</Text>
              <SegmentedControl
                options={SESSION_TYPE_OPTIONS}
                selectedIndex={sessionTypeIndex}
                onChange={setSessionTypeIndex}
              />
            </View>
          )}

          {isGroup && (
            <>
              <View style={styles.playersHeader}>
                <Text style={styles.playersHeaderText}>PLAYERS</Text>
                <Text style={styles.playersCount}>
                  {players.length} players added
                </Text>
              </View>

              {players.map((player, index) => (
                <View key={player.id} style={styles.field}>
                  <View style={styles.playerLabelRow}>
                    <Text style={styles.label}>Player {index + 1}</Text>
                    <TouchableOpacity onPress={() => handleRemovePlayer(index)}>
                      <Text style={styles.removeText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                  <Input
                    value={`${player.name}  #${player.identifier}`}
                    onChangeText={() => {}}
                    editable={false}
                  />
                </View>
              ))}

              <Button
                label="ADD MORE"
                onPress={() => setShowPlayerModal(true)}
                variant="primary_dark"
                leftIcon={<PlusIcon size={16} color={colors.primary.main} />}
                style={styles.addMoreButton}
              />
            </>
          )}

          {!isGroup && (
            <View style={styles.field}>
              <Text style={styles.label}>Mode</Text>
              <SegmentedControl
                options={MODE_OPTIONS}
                selectedIndex={modeIndex}
                onChange={setModeIndex}
              />
            </View>
          )}

          <View style={styles.field}>
            <Text style={styles.label}>Pitch Length</Text>
            <CustomSlider
              value={pitchLength}
              onValueChange={setPitchLength}
              min={10}
              max={22}
              unitLabel={`${pitchLength} Yards (Stumps to Stumps)`}
            />
          </View>
        </View>
      </ScrollView>

      <SelectPlayerModal
        isVisible={showPlayerModal}
        onClose={() => setShowPlayerModal(false)}
        onSelect={handlePlayerSelected}
        alreadySelectedIds={players.map(p => p.id)}
        enableBatchSelection={forceGroup}
        academyId={academyId}
      />
    </BaseAuthLayout>
  );
};
