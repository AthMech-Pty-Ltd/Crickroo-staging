import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  CheckCircleIcon,
  CircleIcon,
  CaretDownIcon,
  CaretUpIcon,
} from 'phosphor-react-native';
import { SearchInput } from '../../common/SearchInput';
import { SegmentedControl } from '../../common/SegmentedControl';
import { Button } from '../../common/Button';
import { colors } from '../../../theme/colors';
import {
  playerService,
  PlayerSearchResult,
} from '../../../services/player.service';
import { academyService } from '../../../services/academy.service';
import { Batch } from '../../../types/academy';
import { styles } from './styles';

export interface PlayerOption {
  id: string;
  name: string;
  identifier: string;
}

interface SelectPlayerModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSelect: (players: PlayerOption[]) => void;
  alreadySelectedIds: string[];
  // When enabled (coach mode), an extra "Batches" tab lets the coach add every
  // player of a batch at once. Requires academyId for the batch-players API.
  enableBatchSelection?: boolean;
  academyId?: string;
}

export const SelectPlayerModal: React.FC<SelectPlayerModalProps> = ({
  isVisible,
  onClose,
  onSelect,
  alreadySelectedIds,
  enableBatchSelection = false,
  academyId,
}) => {
  const showTabs = enableBatchSelection && !!academyId;

  const [tabIndex, setTabIndex] = useState(0); // 0 = search, 1 = batches
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<PlayerSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Selected players keyed by user id, so picks from search and batches merge.
  const [selected, setSelected] = useState<Map<string, PlayerOption>>(
    new Map(),
  );
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Batch tab state
  const [batches, setBatches] = useState<Batch[]>([]);
  const [batchesLoading, setBatchesLoading] = useState(false);
  const [expandedBatchId, setExpandedBatchId] = useState<string | null>(null);
  const [batchPlayers, setBatchPlayers] = useState<
    Record<string, PlayerOption[]>
  >({});
  // Batch waiting on its players to load before it expands (avoids the
  // open → spinner → collapse flicker).
  const [pendingBatchId, setPendingBatchId] = useState<string | null>(null);

  useEffect(() => {
    if (!isVisible) return;
    setTabIndex(0);
    setSearch('');
    setResults([]);
    setError(null);
    setSelected(new Map());
    setExpandedBatchId(null);
    setPendingBatchId(null);
  }, [isVisible]);

  // Once the pending batch's players have loaded, expand it.
  useEffect(() => {
    if (pendingBatchId && batchPlayers[pendingBatchId]) {
      setExpandedBatchId(pendingBatchId);
      setPendingBatchId(null);
    }
  }, [pendingBatchId, batchPlayers]);

  const loadBatches = async () => {
    setBatchesLoading(true);
    try {
      const data = await academyService.getCoachBatches();
      setBatches(data);
    } catch (err) {
      console.warn('Failed to fetch batches:', err);
      setBatches([]);
    } finally {
      setBatchesLoading(false);
    }
  };

  const loadBatchPlayers = async (batchId: string) => {
    if (!academyId) return;
    try {
      const players = await academyService.getBatchPlayers(academyId, batchId);
      setBatchPlayers(prev => ({
        ...prev,
        [batchId]: players.map(p => ({
          id: p.player_user_id,
          name: p.name,
          identifier: p.cric_id,
        })),
      }));
    } catch (err) {
      console.warn('Failed to fetch batch players:', err);
      setBatchPlayers(prev => ({ ...prev, [batchId]: [] }));
    }
  };

  const handleTabChange = (index: number) => {
    setTabIndex(index);
    if (index === 1 && batches.length === 0 && !batchesLoading) {
      loadBatches();
    }
  };

  const handleSearch = (text: string) => {
    setSearch(text);
    setError(null);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (text.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceTimer.current = setTimeout(async () => {
      try {
        const data = await playerService.searchPlayers(text);
        setResults(data.results);
      } catch (err: any) {
        const status = err?.response?.status;
        if (status === 400) {
          setError('Enter at least 2 characters to search.');
        } else if (status === 422) {
          setError('Invalid search query.');
        } else {
          setError('Failed to search players. Try again.');
        }
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  const isSelected = (id: string) => selected.has(id);

  const toggleOption = (option: PlayerOption) => {
    setSelected(prev => {
      const next = new Map(prev);
      if (next.has(option.id)) {
        next.delete(option.id);
      } else {
        next.set(option.id, option);
      }
      return next;
    });
  };

  const setManySelected = (options: PlayerOption[], on: boolean) => {
    setSelected(prev => {
      const next = new Map(prev);
      options.forEach(o => {
        if (on) {
          next.set(o.id, o);
        } else {
          next.delete(o.id);
        }
      });
      return next;
    });
  };

  const handleConfirm = () => {
    if (selected.size === 0) return;
    onSelect(Array.from(selected.values()));
    onClose();
  };

  // A selectable player row used by both the search and batch lists.
  const renderSelectableRow = (
    option: PlayerOption,
    rowStyle: object,
    key?: string,
  ) => {
    const checked = isSelected(option.id);
    const alreadyAdded = alreadySelectedIds.includes(option.id);
    return (
      <TouchableOpacity
        key={key ?? option.id}
        style={[rowStyle, checked && styles.playerItemSelected]}
        onPress={() => !alreadyAdded && toggleOption(option)}
        activeOpacity={0.7}
        disabled={alreadyAdded}
      >
        <View style={styles.playerInfo}>
          <Text style={[styles.playerName, alreadyAdded && styles.playerDim]}>
            {option.name}
          </Text>
          <Text style={[styles.playerId, alreadyAdded && styles.playerDim]}>
            {option.identifier}
          </Text>
        </View>
        {checked && (
          <CheckCircleIcon
            size={24}
            color={colors.success.main}
            weight="regular"
          />
        )}
        {alreadyAdded && <Text style={styles.addedText}>Added</Text>}
      </TouchableOpacity>
    );
  };

  const renderSearchPlayer = ({ item }: { item: PlayerSearchResult }) =>
    renderSelectableRow(
      { id: item.user_id, name: item.name, identifier: item.cric_id },
      styles.playerItem,
    );

  const renderEmpty = () => {
    if (loading) return null;
    if (search.length < 2) return null;
    if (error) {
      return <Text style={styles.errorText}>{error}</Text>;
    }
    return <Text style={styles.hintText}>No players found</Text>;
  };

  const renderBatch = (batch: Batch) => {
    const expanded = expandedBatchId === batch.id;
    const pending = pendingBatchId === batch.id;
    const isEmpty = batch.player_count === 0;
    const players = batchPlayers[batch.id];
    const selectable = (players ?? []).filter(
      p => !alreadySelectedIds.includes(p.id),
    );
    const allSelected =
      selectable.length > 0 && selectable.every(p => isSelected(p.id));

    return (
      <View key={batch.id} style={styles.batchCard}>
        <TouchableOpacity
          style={[styles.batchHeader, isEmpty && styles.batchHeaderDisabled]}
          activeOpacity={0.7}
          disabled={isEmpty}
          onPress={() => {
            if (expanded) {
              setExpandedBatchId(null);
            } else if (players) {
              setExpandedBatchId(batch.id);
            } else {
              setPendingBatchId(batch.id);
              loadBatchPlayers(batch.id);
            }
          }}
        >
          <View>
            <Text style={styles.batchName}>{batch.name}</Text>
            <Text style={styles.batchMeta}>{batch.player_count} Players</Text>
          </View>
          {pending ? (
            <ActivityIndicator size="small" color={colors.neutrals[70]} />
          ) : isEmpty ? null : expanded ? (
            <CaretUpIcon size={20} color={colors.neutrals[70]} />
          ) : (
            <CaretDownIcon size={20} color={colors.neutrals[70]} />
          )}
        </TouchableOpacity>

        {expanded && (
          <>
            {selectable.length > 0 && (
              <TouchableOpacity
                style={styles.selectAllRow}
                activeOpacity={0.7}
                onPress={() => setManySelected(selectable, !allSelected)}
              >
                <Text style={styles.selectAllText}>
                  {allSelected ? 'Deselect All' : 'Select All'}
                </Text>
                {allSelected ? (
                  <CheckCircleIcon
                    size={22}
                    color={colors.success.main}
                    weight="regular"
                  />
                ) : (
                  <CircleIcon size={22} color={colors.neutrals[40]} />
                )}
              </TouchableOpacity>
            )}
            {(players ?? []).map(p =>
              renderSelectableRow(
                p,
                styles.batchPlayerRow,
                `${batch.id}-${p.id}`,
              ),
            )}
          </>
        )}
      </View>
    );
  };

  const hasSelection = selected.size > 0;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Select Player</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {showTabs && (
            <SegmentedControl
              options={['Players', 'Batches']}
              selectedIndex={tabIndex}
              onChange={handleTabChange}
              style={styles.tabs}
            />
          )}

          {tabIndex === 0 ? (
            <>
              <SearchInput
                value={search}
                onChangeText={handleSearch}
                placeholder="Search Players..."
                style={styles.search}
              />
              {loading ? (
                <ActivityIndicator
                  color={colors.primary.main}
                  style={styles.loader}
                />
              ) : (
                <FlatList
                  data={results}
                  keyExtractor={item => item.user_id}
                  renderItem={renderSearchPlayer}
                  ListEmptyComponent={renderEmpty}
                  contentContainerStyle={styles.list}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                />
              )}
            </>
          ) : batchesLoading ? (
            <ActivityIndicator
              color={colors.primary.main}
              style={styles.loader}
            />
          ) : (
            <ScrollView
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {batches.length === 0 ? (
                <Text style={styles.hintText}>No batches found</Text>
              ) : (
                batches.map(renderBatch)
              )}
            </ScrollView>
          )}

          <View style={styles.footer}>
            <Button
              label={hasSelection ? `CONFIRM (${selected.size})` : 'CANCEL'}
              onPress={hasSelection ? handleConfirm : onClose}
              variant={hasSelection ? 'primary' : 'primary_dark'}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
