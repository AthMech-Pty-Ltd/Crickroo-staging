import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeftIcon,
  DotsThreeVerticalIcon,
  UserCircleIcon,
  UsersIcon,
  // UserPlusIcon,
} from 'phosphor-react-native';
import { UserRole } from '../../types/auth';
import { CoachPlayer } from '../../types/academy';
import { Button } from '../../components/common/Button';
import { SearchInput } from '../../components/common/SearchInput';
import { AddPlayerModal } from '../CoachHome/modals/AddPlayerModal';
import { PlayerOptionsModal } from '../CoachHome/modals/PlayerOptionsModal';
import { ChangeBatchModal } from '../CoachHome/modals/ChangeBatchModal';
import { DeletePlayerModal } from '../CoachHome/modals/DeletePlayerModal';
import { JoinRequestsModal, JoinRequest } from './modals/JoinRequestsModal';
import { colors } from '../../theme/colors';
import { styles } from './styles';

export interface PlayerEntry {
  id: string;
  linkId: string;
  name: string;
  athleteCode: string;
  batchId: string;
  batchName: string;
  avatarUrl?: string | null;
}

interface PlayersScreenProps {
  role?: UserRole;
  players?: PlayerEntry[];
  batchOptions: string[];
  joinRequests?: JoinRequest[];
  unassignedPlayers?: CoachPlayer[];
  onBack: () => void;
  onCreatePlayer?: (params: { playerId: string; batchName: string }) => void;
  onChangePlayerBatch?: (playerId: string, batchName: string) => void;
  onDeletePlayer?: (playerId: string) => void;
  onDeleteUnassigned?: (playerId: string) => void;
  onApproveRequest?: (requestId: string) => void;
  onRejectRequest?: (id: string) => void;
  onAssignUnassigned?: (playerId: string, batchName: string) => void;
  onOpenJoinRequests?: () => void;
  onPlayerPress?: (cricId: string, name: string) => void;
}

type ModalKey =
  | 'join_requests'
  | 'add_player'
  | 'player_options'
  | 'unassigned_options'
  | 'change_batch'
  | 'delete_player'
  | 'delete_unassigned'
  | 'assign_unassigned'
  | null;

export const PlayersScreen: React.FC<PlayersScreenProps> = ({
  // role,
  players = [],
  batchOptions,
  joinRequests = [],
  unassignedPlayers = [],
  onBack,
  onCreatePlayer,
  onChangePlayerBatch,
  onDeletePlayer,
  onDeleteUnassigned,
  onApproveRequest,
  onRejectRequest,
  onAssignUnassigned,
  onOpenJoinRequests,
  onPlayerPress,
}) => {
  // const canManage = canManageRoster(role);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<ModalKey>(null);
  const [activePlayerId, setActivePlayerId] = useState<string | null>(null);
  const [pendingAssignPlayer, setPendingAssignPlayer] =
    useState<CoachPlayer | null>(null);

  const activePlayer = players.find(s => s.id === activePlayerId) ?? null;
  const closeModal = () => setModal(null);

  useEffect(() => {
    if (modal === 'join_requests' && joinRequests.length === 0) {
      closeModal();
    }
  }, [joinRequests.length, modal]);

  const filteredAssigned = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return players;
    return players.filter(
      s =>
        s.name.toLowerCase().includes(q) ||
        s.athleteCode.toLowerCase().includes(q),
    );
  }, [players, search]);

  const filteredUnassigned = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return unassignedPlayers;
    return unassignedPlayers.filter(
      p =>
        p.name.toLowerCase().includes(q) || p.cric_id.toLowerCase().includes(q),
    );
  }, [unassignedPlayers, search]);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <ArrowLeftIcon size={22} color={colors.neutrals.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Players</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <SearchInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search Players..."
            style={styles.search}
          />

          <View style={styles.actionsRow}>
            <Button
              label="Join Requests"
              variant="primary_dark"
              onPress={() => {
                onOpenJoinRequests?.();
                if (joinRequests.length > 0) setModal('join_requests');
              }}
              style={styles.actionButton}
              leftIcon={
                joinRequests.length > 0 ? (
                  <View style={styles.joinRequestsBadge}>
                    <Text style={styles.joinRequestsBadgeText}>
                      {joinRequests.length}
                    </Text>
                  </View>
                ) : (
                  <UsersIcon size={20} color={colors.primary.main} />
                )
              }
            />
            {/* canManage && (
            <Button
              label="Add Player"
              variant="primary_dark"
              onPress={() => setModal('add_player')}
              style={styles.actionButton}
              leftIcon={<UserPlusIcon size={20} color={colors.primary.main} />}
            />
          ) */}
          </View>

          {filteredAssigned.length === 0 && filteredUnassigned.length === 0 && (
            <Text style={styles.emptyText}>No players found</Text>
          )}

          {filteredAssigned.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionHeaderText}>Assigned Players</Text>
                <View style={styles.sectionBadge}>
                  <Text style={styles.sectionBadgeText}>
                    {filteredAssigned.length}
                  </Text>
                </View>
              </View>
              <View style={[styles.listCard, styles.listCardSpaced]}>
                {filteredAssigned.map((player, index) => (
                  <View
                    key={player.id}
                    style={[
                      styles.playerRow,
                      index > 0 && styles.playerRowDivider,
                    ]}
                  >
                    <TouchableOpacity
                      style={{
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}
                      activeOpacity={0.7}
                      onPress={() =>
                        onPlayerPress?.(player.athleteCode, player.name)
                      }
                    >
                      {player.avatarUrl ? (
                        <Image
                          source={{ uri: player.avatarUrl }}
                          style={styles.avatarImage}
                        />
                      ) : (
                        <UserCircleIcon
                          size={44}
                          color={colors.neutrals[40]}
                          style={styles.avatarPlaceholder}
                        />
                      )}
                      <View style={styles.info}>
                        <Text style={styles.name}>{player.name}</Text>
                        <Text style={styles.meta}>
                          {player.athleteCode} · {player.batchName}
                        </Text>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.menuButton}
                      activeOpacity={0.7}
                      hitSlop={8}
                      onPress={() => {
                        setActivePlayerId(player.id);
                        setModal('player_options');
                      }}
                    >
                      <DotsThreeVerticalIcon
                        size={22}
                        color={colors.neutrals[70]}
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </>
          )}

          {filteredUnassigned.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionHeaderText}>Unassigned Players</Text>
                <View style={styles.sectionBadge}>
                  <Text style={styles.sectionBadgeText}>
                    {filteredUnassigned.length}
                  </Text>
                </View>
              </View>
              <View style={[styles.listCard, styles.listCardSpaced]}>
                {filteredUnassigned.map((player, index) => (
                  <View
                    key={player.player_id}
                    style={[
                      styles.playerRow,
                      index > 0 && styles.playerRowDivider,
                    ]}
                  >
                    <TouchableOpacity
                      style={{
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}
                      activeOpacity={0.7}
                      onPress={() =>
                        onPlayerPress?.(player.cric_id, player.name)
                      }
                    >
                      {player.profile_image_url ? (
                        <Image
                          source={{ uri: player.profile_image_url }}
                          style={styles.avatarImage}
                        />
                      ) : (
                        <UserCircleIcon
                          size={44}
                          color={colors.neutrals[40]}
                          style={styles.avatarPlaceholder}
                        />
                      )}
                      <View style={styles.info}>
                        <Text style={styles.name}>{player.name}</Text>
                        <Text style={styles.meta}>{player.cric_id}</Text>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.menuButton}
                      activeOpacity={0.7}
                      hitSlop={8}
                      onPress={() => {
                        setPendingAssignPlayer(player);
                        setModal('unassigned_options');
                      }}
                    >
                      <DotsThreeVerticalIcon
                        size={22}
                        color={colors.neutrals[70]}
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </>
          )}
        </ScrollView>

        <JoinRequestsModal
          isVisible={modal === 'join_requests'}
          requests={joinRequests}
          onClose={closeModal}
          onApprove={id => onApproveRequest?.(id)}
          onReject={id => onRejectRequest?.(id)}
        />

        <AddPlayerModal
          isVisible={modal === 'add_player'}
          batchOptions={batchOptions}
          onClose={closeModal}
          onSubmit={({ playerId, batch }) => {
            onCreatePlayer?.({ playerId, batchName: batch });
            closeModal();
          }}
        />

        <PlayerOptionsModal
          isVisible={modal === 'player_options' && activePlayer !== null}
          playerName={activePlayer?.name ?? ''}
          playerMeta={`${activePlayer?.athleteCode ?? ''} · ${
            activePlayer?.batchName ?? ''
          }`}
          avatarUrl={activePlayer?.avatarUrl}
          batchLabel="Change Batch"
          onClose={closeModal}
          onChangeBatch={() => setModal('change_batch')}
          onDelete={() => setModal('delete_player')}
        />

        <PlayerOptionsModal
          isVisible={
            modal === 'unassigned_options' && pendingAssignPlayer !== null
          }
          playerName={pendingAssignPlayer?.name ?? ''}
          playerMeta={pendingAssignPlayer?.cric_id ?? ''}
          deleteLabel="Delete Player"
          onClose={() => {
            setPendingAssignPlayer(null);
            closeModal();
          }}
          onChangeBatch={() => setModal('assign_unassigned')}
          onDelete={() => setModal('delete_unassigned')}
        />

        <ChangeBatchModal
          isVisible={modal === 'change_batch' && activePlayer !== null}
          playerName={activePlayer?.name ?? ''}
          playerMeta={`${activePlayer?.athleteCode ?? ''} · ${
            activePlayer?.batchName ?? ''
          }`}
          currentBatch={activePlayer?.batchName ?? ''}
          batchOptions={batchOptions}
          avatarUrl={activePlayer?.avatarUrl}
          onClose={closeModal}
          onSave={batch => {
            if (activePlayer) onChangePlayerBatch?.(activePlayer.id, batch);
            closeModal();
          }}
        />

        <DeletePlayerModal
          isVisible={modal === 'delete_player' && activePlayer !== null}
          playerName={activePlayer?.name ?? ''}
          playerMeta={`${activePlayer?.athleteCode ?? ''} · ${
            activePlayer?.batchName ?? ''
          }`}
          batchName={activePlayer?.batchName ?? ''}
          avatarUrl={activePlayer?.avatarUrl}
          onClose={closeModal}
          onConfirm={() => {
            if (activePlayer) onDeletePlayer?.(activePlayer.id);
            closeModal();
          }}
        />

        <DeletePlayerModal
          isVisible={
            modal === 'delete_unassigned' && pendingAssignPlayer !== null
          }
          playerName={pendingAssignPlayer?.name ?? ''}
          playerMeta={pendingAssignPlayer?.cric_id ?? ''}
          batchName=""
          onClose={closeModal}
          onConfirm={() => {
            if (pendingAssignPlayer)
              onDeleteUnassigned?.(pendingAssignPlayer.player_id);
            setPendingAssignPlayer(null);
            closeModal();
          }}
        />

        <ChangeBatchModal
          isVisible={
            modal === 'assign_unassigned' && pendingAssignPlayer !== null
          }
          title="Assign to Batch"
          playerName={pendingAssignPlayer?.name ?? ''}
          playerMeta={pendingAssignPlayer?.cric_id ?? ''}
          currentBatch=""
          batchOptions={batchOptions}
          onClose={() => {
            setPendingAssignPlayer(null);
            closeModal();
          }}
          onSave={batchName => {
            if (pendingAssignPlayer) {
              onAssignUnassigned?.(pendingAssignPlayer.player_id, batchName);
            }
            setPendingAssignPlayer(null);
            closeModal();
          }}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export { PlayerStatsScreen } from './PlayerStatsScreen';
