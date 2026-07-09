import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { MagnifyingGlassIcon, CheckCircleIcon } from 'phosphor-react-native';
import { BottomSheet } from '../../common/BottomSheet';
import { SegmentedControl } from '../../common/SegmentedControl';
import { Input } from '../../common/Input';
import { Button } from '../../common/Button';
import { colors } from '../../../theme/colors';
import { styles } from './styles';

export interface TagPlayer {
  id: string;
  name: string;
  code: string;
}

export interface TagSelection {
  batsmanId: string | null;
  bowlerId: string | null;
}

interface TagPlayersModalProps {
  isVisible: boolean;
  players: TagPlayer[];
  initialSelection?: TagSelection;
  mode?: 'batter' | 'bowler';
  onClose: () => void;
  onDone: (selection: TagSelection) => void;
}

const ROLES = ['BATTER', 'BOWLER'];

export const TagPlayersModal: React.FC<TagPlayersModalProps> = ({
  isVisible,
  players,
  initialSelection,
  mode,
  onClose,
  onDone,
}) => {
  const [roleIndex, setRoleIndex] = useState(0); // 0 = batsman, 1 = bowler
  const [search, setSearch] = useState('');
  const [batsmanId, setBatsmanId] = useState<string | null>(
    initialSelection?.batsmanId ?? null,
  );
  const [bowlerId, setBowlerId] = useState<string | null>(
    initialSelection?.bowlerId ?? null,
  );

  // Reset transient state each time the sheet opens.
  useEffect(() => {
    if (isVisible) {
      setRoleIndex(mode === 'bowler' ? 1 : 0);
      setSearch('');
      setBatsmanId(initialSelection?.batsmanId ?? null);
      setBowlerId(initialSelection?.bowlerId ?? null);
    }
  }, [isVisible, initialSelection, mode]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return players;
    return players.filter(
      p => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q),
    );
  }, [players, search]);

  const selectedId = roleIndex === 0 ? batsmanId : bowlerId;

  const handleSelect = (id: string) => {
    if (mode === 'batter') {
      setBatsmanId(id);
      return;
    }

    if (mode === 'bowler') {
      setBowlerId(id);
      return;
    }

    const next = id === selectedId ? null : id;
    if (roleIndex === 0) setBatsmanId(next);
    else setBowlerId(next);
  };

  const title = mode === 'bowler' ? 'Tag Bowler' : mode === 'batter' ? 'Tag Batter' : 'Tag Players';

  return (
    <BottomSheet isVisible={isVisible} title={title} onClose={onClose}>
      {!mode && (
        <View style={styles.tabs}>
          <SegmentedControl
            options={ROLES}
            selectedIndex={roleIndex}
            onChange={setRoleIndex}
            variant="dashboard"
          />
        </View>
      )}

      <Input
        placeholder="Search Players..."
        value={search}
        onChangeText={setSearch}
        autoCapitalize="none"
        autoCorrect={false}
        containerStyle={styles.search}
        leftIcon={<MagnifyingGlassIcon size={20} color={colors.neutrals[40]} />}
      />

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {filtered.length === 0 ? (
          <Text style={styles.empty}>No players found</Text>
        ) : (
          filtered.map(player => {
            const isSelected = player.id === selectedId;
            return (
              <TouchableOpacity
                key={player.id}
                activeOpacity={0.8}
                style={[styles.row, isSelected && styles.rowSelected]}
                onPress={() => handleSelect(player.id)}
              >
                <View style={styles.rowText}>
                  <Text style={styles.name} numberOfLines={1}>
                    {player.name}
                  </Text>
                  <Text style={styles.code} numberOfLines={1}>
                    {player.code}
                  </Text>
                </View>
                {isSelected && (
                  <CheckCircleIcon size={24} color={colors.success.main} />
                )}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      <Button
        label="DONE"
        variant="primary"
        onPress={() => onDone({ batsmanId, bowlerId })}
        style={styles.doneButton}
      />
    </BottomSheet>
  );
};
