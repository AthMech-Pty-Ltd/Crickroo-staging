import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  ActivityIndicator,
} from 'react-native';
import {
  StudentIcon as PlayerStatIcon,
  CheckCircleIcon,
  VideoCameraIcon,
  FolderPlusIcon,
  // UserPlusIcon,
  CaretUpIcon,
  CaretDownIcon,
  DotsThreeVerticalIcon,
  TrashSimpleIcon,
  ArrowsClockwiseIcon,
  UserCircleIcon,
} from 'phosphor-react-native';
import { Button } from '../../components/common/Button';
import { BatchOptionsModal } from './modals/BatchOptionsModal';
import { RenameBatchModal } from './modals/RenameBatchModal';
import { DeleteBatchModal } from './modals/DeleteBatchModal';
import { AddBatchModal } from './modals/AddBatchModal';
import { AddPlayerModal } from './modals/AddPlayerModal';
import { DeletePlayerModal } from './modals/DeletePlayerModal';
import { ChangeBatchModal } from './modals/ChangeBatchModal';
import { PlayersScreen, PlayerEntry, PlayerStatsScreen } from '../Players';
import { JoinRequest } from '../Players/modals/JoinRequestsModal';
import { UserRole, canManageRoster, isCoachRole } from '../../types/auth';
import { academyService } from '../../services/academy.service';
import {
  AcademyPlayer,
  Batch,
  BatchPlayer,
  CoachPlayer,
  JoinRequestItem,
} from '../../types/academy';
import { colors } from '../../theme/colors';
import { styles } from './styles';

interface BatchPlayerEntry {
  id: string;
  linkId: string;
  name: string;
  athleteCode: string;
  sessions: number;
  avatarUrl?: string | null;
}

interface CoachBatch {
  id: string;
  name: string;
  playerCount: number;
}

interface CoachHomeProps {
  role?: UserRole;
  academyId?: string;
  isActive?: boolean;
  batches?: CoachBatch[];
  playerCount?: number;
  activeCount?: number;
  sessionCount?: number;
  onOpenPlayer?: (cricId: string, name: string) => void;
  onDeletePlayer?: (playerId: string) => void;
  onRenameBatch?: (batchId: string, name: string) => void;
  onDeleteBatch?: (batchId: string) => void;
  onCreatePlayer?: (params: { playerId: string; batchName: string }) => void;
}

type ModalKey =
  | 'batch_options'
  | 'rename_batch'
  | 'delete_batch'
  | 'add_batch'
  | 'add_player'
  | 'delete_player'
  | 'change_batch'
  | null;

const StatCard: React.FC<{
  icon: React.ReactNode;
  value: string | number;
  label: string;
  badge?: number;
  onPress?: () => void;
}> = ({ icon, value, label, badge, onPress }) => {
  const Wrapper: any = onPress ? TouchableOpacity : View;
  return (
    <Wrapper
      style={styles.statCard}
      activeOpacity={onPress ? 0.8 : 1}
      onPress={onPress}
    >
      <View style={styles.statIconCircle}>
        {icon}
        {!!badge && badge > 0 && (
          <View style={styles.statBadge}>
            <Text style={styles.statBadgeText}>{badge}</Text>
          </View>
        )}
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Wrapper>
  );
};

const PlayerRow: React.FC<{
  player: BatchPlayerEntry;
  onPress?: () => void;
  onChangeBatch?: () => void;
  onDelete?: () => void;
}> = ({ player, onPress, onChangeBatch, onDelete }) => (
  <TouchableOpacity
    style={styles.playerRow}
    activeOpacity={0.7}
    onPress={onPress}
  >
    {player.avatarUrl ? (
      <Image
        source={{ uri: player.avatarUrl }}
        style={styles.playerAvatarImage}
      />
    ) : (
      <UserCircleIcon
        size={44}
        color={colors.neutrals[40]}
        style={styles.playerAvatarPlaceholder}
      />
    )}
    <View style={styles.playerInfo}>
      <Text style={styles.playerName}>{player.name}</Text>
      <Text style={styles.playerMeta}>
        {player.athleteCode} · {player.sessions} Session
      </Text>
    </View>
    {onChangeBatch && (
      <TouchableOpacity
        style={styles.playerActionButton}
        activeOpacity={0.7}
        onPress={onChangeBatch}
        hitSlop={8}
      >
        <ArrowsClockwiseIcon size={18} color={colors.primary.main} />
      </TouchableOpacity>
    )}
    {onDelete && (
      <TouchableOpacity
        style={styles.playerActionButton}
        activeOpacity={0.7}
        onPress={onDelete}
        hitSlop={8}
      >
        <TrashSimpleIcon size={18} color={colors.error[65]} />
      </TouchableOpacity>
    )}
  </TouchableOpacity>
);

const BatchCard: React.FC<{
  batch: CoachBatch;
  players: BatchPlayerEntry[] | null;
  onExpand: () => void;
  onOpenPlayer?: (cricId: string, name: string) => void;
  onChangePlayerBatch?: (id: string) => void;
  onDeletePlayer?: (id: string) => void;
  onMenu?: () => void;
}> = ({
  batch,
  players,
  onExpand,
  onOpenPlayer,
  onChangePlayerBatch,
  onDeletePlayer,
  onMenu,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [pendingOpen, setPendingOpen] = useState(false);

  // While opening for the first time we wait for the players to load before
  // expanding, so the accordion opens straight to its content (no flicker).
  useEffect(() => {
    if (pendingOpen && players !== null) {
      setExpanded(true);
      setPendingOpen(false);
    }
  }, [pendingOpen, players]);

  const toggle = () => {
    if (expanded) {
      setExpanded(false);
      return;
    }
    onExpand();
    if (players !== null) {
      setExpanded(true);
    } else {
      setPendingOpen(true);
    }
  };

  return (
    <View style={styles.batchCard}>
      <TouchableOpacity
        style={styles.batchHeader}
        activeOpacity={0.7}
        onPress={toggle}
      >
        <View style={styles.batchHeaderText}>
          <Text style={styles.batchTitle}>{batch.name}</Text>
          <View style={styles.batchCountRow}>
            <Text style={styles.batchCount}>{batch.playerCount} Players</Text>
            {pendingOpen ? (
              <ActivityIndicator size="small" color={colors.neutrals[70]} />
            ) : expanded ? (
              <CaretUpIcon size={18} color={colors.neutrals[70]} />
            ) : (
              <CaretDownIcon size={18} color={colors.neutrals[70]} />
            )}
          </View>
        </View>
        {onMenu && (
          <TouchableOpacity
            style={styles.batchMenuButton}
            activeOpacity={0.7}
            onPress={onMenu}
            hitSlop={8}
          >
            <DotsThreeVerticalIcon size={22} color={colors.neutrals[70]} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
      {expanded &&
        (players ?? []).map(player => (
          <PlayerRow
            key={player.id}
            player={player}
            onPress={() => onOpenPlayer?.(player.athleteCode, player.name)}
            onChangeBatch={
              onChangePlayerBatch
                ? () => onChangePlayerBatch(player.id)
                : undefined
            }
            onDelete={
              onDeletePlayer ? () => onDeletePlayer(player.id) : undefined
            }
          />
        ))}
    </View>
  );
};

const batchPlayerToPlayer = (p: BatchPlayer): BatchPlayerEntry => ({
  id: p.player_user_id,
  linkId: p.id,
  name: p.name,
  athleteCode: p.cric_id,
  sessions: 0,
  avatarUrl: p.profile_image_url,
});

const toCoachBatch = (batch: Batch): CoachBatch => ({
  id: batch.id,
  name: batch.name,
  playerCount: batch.player_count,
});

const joinRequestItemToJoinRequest = (r: JoinRequestItem): JoinRequest => ({
  id: r.id,
  player_user_id: r.player_user_id,
  name: r.name,
  cric_id: r.cric_id,
  status: r.status,
  requested_at: r.requested_at,
  avatarUrl: r.profile_image_url,
});

export const CoachHome: React.FC<CoachHomeProps> = ({
  role,
  academyId,
  isActive = false,
  batches: propBatches,
  playerCount,
  activeCount = 0,
  sessionCount = 0,
  onOpenPlayer,
  onDeletePlayer,
  onRenameBatch,
  onDeleteBatch,
}) => {
  const [modal, setModal] = useState<ModalKey>(null);
  const [activeBatchId, setActiveBatchId] = useState<string | null>(null);
  const [pendingDeletePlayer, setPendingDeletePlayer] = useState<{
    player: BatchPlayerEntry;
    batch: CoachBatch;
  } | null>(null);
  const [pendingChangeBatchPlayer, setPendingChangeBatchPlayer] = useState<{
    player: BatchPlayerEntry;
    batch: CoachBatch;
  } | null>(null);
  const [selectedPlayerForStats, setSelectedPlayerForStats] = useState<{
    cricId: string;
    name: string;
  } | null>(null);

  const handleOpenPlayerStats = useCallback(
    (cricId: string, name: string) => {
      setSelectedPlayerForStats({ cricId, name });
      onOpenPlayer?.(cricId, name);
    },
    [onOpenPlayer],
  );
  const [fetchedBatches, setFetchedBatches] = useState<CoachBatch[] | null>(
    null,
  );
  const [batchPlayers, setBatchPlayers] = useState<
    Record<string, BatchPlayerEntry[]>
  >({});
  const [fetchedJoinRequests, setFetchedJoinRequests] = useState<
    JoinRequest[] | null
  >(null);
  const [academyPlayers, setAcademyPlayers] = useState<AcademyPlayer[] | null>(
    null,
  );
  const [dashboardUnassignedPlayers, setDashboardUnassignedPlayers] = useState<
    BatchPlayerEntry[] | null
  >(null);
  const [isCreatingBatch, setIsCreatingBatch] = useState(false);
  const [isDeletingBatch, setIsDeletingBatch] = useState(false);
  const [isRenamingBatch, setIsRenamingBatch] = useState(false);
  const [isDeletingPlayer, setIsDeletingPlayer] = useState(false);
  const [isMovingPlayer, setIsMovingPlayer] = useState(false);

  const loadBatches = useCallback(async () => {
    if (!academyId) return;
    try {
      const batches = await academyService.getCoachBatches();
      setFetchedBatches(batches.map(toCoachBatch));
    } catch (err) {
      console.warn('Failed to fetch batches:', err);
      setFetchedBatches([]);
    }
  }, [academyId]);

  const fetchBatchPlayers = useCallback(
    async (batchId: string) => {
      if (!academyId) return;
      try {
        const players = await academyService.getBatchPlayers(
          academyId,
          batchId,
        );
        setBatchPlayers(prev => ({
          ...prev,
          [batchId]: players.map(batchPlayerToPlayer),
        }));
      } catch (err) {
        console.warn('Failed to fetch players for batch', batchId, err);
        setBatchPlayers(prev => ({ ...prev, [batchId]: [] }));
      }
    },
    [academyId],
  );

  const loadJoinRequests = useCallback(async () => {
    try {
      const joinReqs = await academyService.getJoinRequests();
      setFetchedJoinRequests(joinReqs.map(joinRequestItemToJoinRequest));
    } catch (err) {
      console.warn('Failed to fetch join requests:', err);
    }
  }, []);

  // Join requests are already loaded on the home screen (for the badge) and
  // refreshed when the Join Requests button is tapped, so the Players screen
  // only needs to fetch the full players list (assigned + unassigned).
  const loadPlayers = useCallback(async () => {
    if (!academyId) return;
    try {
      const players = await academyService.getAcademyPlayers(academyId);
      setAcademyPlayers(players);
    } catch (err) {
      console.warn('Failed to fetch academy players:', err);
    }
  }, [academyId]);

  const loadUnassignedPlayers = useCallback(async () => {
    if (!academyId) return;
    try {
      const players = await academyService.getAcademyPlayers(academyId, false);
      setDashboardUnassignedPlayers(
        players.map(p => ({
          id: p.player_user_id,
          linkId: p.id,
          name: p.name,
          athleteCode: p.cric_id,
          sessions: 0,
          avatarUrl: p.profile_image_url,
        })),
      );
    } catch (err) {
      console.warn('Failed to fetch unassigned players:', err);
      setDashboardUnassignedPlayers([]);
    }
  }, [academyId]);

  useEffect(() => {
    if (isActive) {
      loadBatches();
      loadJoinRequests();
      loadUnassignedPlayers();
    }
  }, [isActive, loadBatches, loadJoinRequests, loadUnassignedPlayers]);

  const batches: CoachBatch[] = useMemo(
    () => fetchedBatches ?? propBatches ?? [],
    [fetchedBatches, propBatches],
  );

  const allBatches = useMemo(() => {
    const list = [...batches];
    if (dashboardUnassignedPlayers !== null) {
      list.push({
        id: 'unassigned',
        name: 'Unassigned batch',
        playerCount: dashboardUnassignedPlayers.length,
      });
    }
    return list;
  }, [batches, dashboardUnassignedPlayers]);

  const resolvedPlayerCount =
    playerCount ??
    batches.reduce((sum, b) => sum + b.playerCount, 0) +
      (dashboardUnassignedPlayers?.length ?? 0);
  const [showPlayers, setShowPlayers] = useState(false);

  useEffect(() => {
    if (showPlayers) {
      loadPlayers();
    }
  }, [showPlayers, loadPlayers]);

  const batchNameById = useMemo(() => {
    const map: Record<string, string> = {};
    batches.forEach(b => {
      map[b.id] = b.name;
    });
    return map;
  }, [batches]);

  const assignedPlayers: PlayerEntry[] = useMemo(
    () =>
      (academyPlayers ?? [])
        .filter(p => p.is_assigned)
        .map(p => ({
          id: p.player_user_id,
          linkId: p.id,
          name: p.name,
          athleteCode: p.cric_id,
          batchId: p.batch_id ?? '',
          batchName: p.batch_id ? batchNameById[p.batch_id] ?? '' : '',
          avatarUrl: p.profile_image_url,
        })),
    [academyPlayers, batchNameById],
  );

  const unassignedPlayers: CoachPlayer[] = useMemo(
    () =>
      (academyPlayers ?? [])
        .filter(p => !p.is_assigned)
        .map(p => ({
          player_id: p.player_user_id,
          name: p.name,
          cric_id: p.cric_id,
          profile_image_url: p.profile_image_url,
        })),
    [academyPlayers],
  );

  const canManage = canManageRoster(role);
  const canAddBatch = isCoachRole(role);
  const activeBatch = batches.find(b => b.id === activeBatchId) ?? null;
  const batchNames = batches.map(b => b.name);
  const closeModal = () => setModal(null);

  return (
    <>
      <Modal
        visible={showPlayers}
        animationType="slide"
        presentationStyle="fullScreen"
        statusBarTranslucent
        onRequestClose={() => setShowPlayers(false)}
      >
        <PlayersScreen
          role={role}
          batchOptions={batchNames}
          joinRequests={fetchedJoinRequests ?? []}
          onOpenJoinRequests={loadJoinRequests}
          players={assignedPlayers}
          unassignedPlayers={unassignedPlayers}
          onBack={() => setShowPlayers(false)}
          onPlayerPress={handleOpenPlayerStats}
          onCreatePlayer={async ({ playerId, batchName }) => {
            const targetBatch = batches.find(b => b.name === batchName);
            if (!academyId || !targetBatch) return;
            try {
              await academyService.assignPlayerToBatch(
                academyId,
                targetBatch.id,
                playerId,
              );
              await Promise.all([
                loadBatches(),
                loadPlayers(),
                loadUnassignedPlayers(),
              ]);
            } catch (err) {
              console.warn('Failed to assign player to batch:', err);
            }
          }}
          onChangePlayerBatch={async (playerId, batchName) => {
            const targetBatch = batches.find(b => b.name === batchName);
            if (!academyId || !targetBatch) return;
            try {
              await academyService.movePlayerBatch(
                academyId,
                playerId,
                targetBatch.id,
              );
              await Promise.all([
                loadBatches(),
                loadPlayers(),
                loadUnassignedPlayers(),
              ]);
            } catch (err) {
              console.warn('Failed to move player:', err);
            }
          }}
          onDeletePlayer={async playerId => {
            if (!academyId) return;
            try {
              await academyService.deletePlayer(academyId, playerId);
              await Promise.all([
                loadBatches(),
                loadPlayers(),
                loadUnassignedPlayers(),
              ]);
            } catch (err) {
              console.warn('Failed to delete player:', err);
            }
          }}
          onDeleteUnassigned={async playerId => {
            if (!academyId) return;
            try {
              await academyService.deletePlayer(academyId, playerId);
              await Promise.all([loadPlayers(), loadUnassignedPlayers()]);
            } catch (err) {
              console.warn('Failed to delete player:', err);
            }
          }}
          onAssignUnassigned={async (playerId, batchName) => {
            const targetBatch = batches.find(b => b.name === batchName);
            if (!academyId || !targetBatch) return;
            try {
              await academyService.assignPlayerToBatch(
                academyId,
                targetBatch.id,
                playerId,
              );
              await Promise.all([
                loadBatches(),
                loadPlayers(),
                loadUnassignedPlayers(),
              ]);
            } catch (err) {
              console.warn('Failed to assign unassigned player:', err);
            }
          }}
          onApproveRequest={async requestId => {
            try {
              await academyService.approveJoinRequest(requestId);
              // Approved player becomes an unassigned player; batch counts are
              // unaffected, so only join requests and the players list change.
              await Promise.all([
                loadJoinRequests(),
                loadPlayers(),
                loadUnassignedPlayers(),
              ]);
            } catch (err) {
              console.warn('Failed to approve join request:', err);
            }
          }}
          onRejectRequest={async requestId => {
            try {
              await academyService.rejectJoinRequest(requestId);
              await loadJoinRequests();
            } catch (err) {
              console.warn('Failed to reject join request:', err);
            }
          }}
        />
      </Modal>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statsRow}>
          <StatCard
            icon={
              <PlayerStatIcon
                size={22}
                color={colors.primary.main}
                weight="fill"
              />
            }
            value={resolvedPlayerCount}
            label="Players"
            badge={fetchedJoinRequests?.length}
            onPress={() => setShowPlayers(true)}
          />
          <StatCard
            icon={<CheckCircleIcon size={22} color={colors.success.main} />}
            value={activeCount}
            label="Active"
          />
          <StatCard
            icon={<VideoCameraIcon size={22} color={colors.semantic.blue70} />}
            value={sessionCount}
            label="Sessions"
          />
        </View>

        {canAddBatch && (
          <View style={styles.actionsRow}>
            <Button
              label="Add Batch"
              variant="primary_dark"
              onPress={() => setModal('add_batch')}
              style={styles.actionButton}
              leftIcon={
                <FolderPlusIcon size={22} color={colors.primary.main} />
              }
            />
            {/* <Button
              label="Add Player"
              variant="primary_dark"
              onPress={() => {
                setActiveBatchId(null);
                setModal('add_player');
              }}
              style={styles.actionButton}
              leftIcon={<UserPlusIcon size={22} color={colors.primary.main} />}
            /> */}
          </View>
        )}

        {fetchedBatches === null && allBatches.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ActivityIndicator size="small" color={colors.primary.main} />
          </View>
        ) : allBatches.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No batches found</Text>
          </View>
        ) : (
          allBatches.map(batch => (
            <BatchCard
              key={batch.id}
              batch={batch}
              players={
                batch.id === 'unassigned'
                  ? dashboardUnassignedPlayers
                  : batchPlayers[batch.id] ?? null
              }
              onExpand={() => {
                if (batch.id === 'unassigned') {
                  loadUnassignedPlayers();
                } else {
                  fetchBatchPlayers(batch.id);
                }
              }}
              onOpenPlayer={handleOpenPlayerStats}
              onChangePlayerBatch={
                canManage && batch.id !== 'unassigned'
                  ? playerId => {
                      const player = (batchPlayers[batch.id] ?? []).find(
                        s => s.id === playerId,
                      );
                      if (!player) return;
                      setPendingChangeBatchPlayer({ player, batch });
                      setModal('change_batch');
                    }
                  : undefined
              }
              onDeletePlayer={
                canManage && batch.id !== 'unassigned'
                  ? playerId => {
                      const player = (batchPlayers[batch.id] ?? []).find(
                        s => s.id === playerId,
                      );
                      if (!player) return;
                      setPendingDeletePlayer({ player, batch });
                      setModal('delete_player');
                    }
                  : undefined
              }
              onMenu={
                canManage && batch.id !== 'unassigned'
                  ? () => {
                      setActiveBatchId(batch.id);
                      setModal('batch_options');
                    }
                  : undefined
              }
            />
          ))
        )}
      </ScrollView>

      <BatchOptionsModal
        isVisible={modal === 'batch_options' && activeBatch !== null}
        batchName={activeBatch?.name ?? ''}
        playerCount={activeBatch?.playerCount ?? 0}
        onClose={closeModal}
        onRename={() => setModal('rename_batch')}
        onDelete={() => setModal('delete_batch')}
      />

      <RenameBatchModal
        isVisible={modal === 'rename_batch' && activeBatch !== null}
        initialName={activeBatch?.name ?? ''}
        loading={isRenamingBatch}
        onClose={closeModal}
        onSave={async name => {
          if (!activeBatch) return;
          if (academyId && !isRenamingBatch) {
            try {
              setIsRenamingBatch(true);
              await academyService.renameBatch(academyId, activeBatch.id, name);
              await loadBatches();
            } catch (err) {
              console.warn('Failed to rename batch:', err);
            } finally {
              setIsRenamingBatch(false);
            }
          } else {
            onRenameBatch?.(activeBatch.id, name);
          }
          closeModal();
        }}
      />

      <DeleteBatchModal
        isVisible={modal === 'delete_batch' && activeBatch !== null}
        batchName={activeBatch?.name ?? ''}
        playerCount={activeBatch?.playerCount ?? 0}
        onClose={closeModal}
        onConfirm={async () => {
          if (!activeBatch) return;
          if (academyId && !isDeletingBatch) {
            try {
              setIsDeletingBatch(true);
              await academyService.deleteBatch(academyId, activeBatch.id);
              await Promise.all([loadBatches(), loadUnassignedPlayers()]);
            } catch (err) {
              console.warn('Failed to delete batch:', err);
            } finally {
              setIsDeletingBatch(false);
            }
          } else {
            onDeleteBatch?.(activeBatch.id);
          }
          closeModal();
        }}
      />

      <AddBatchModal
        isVisible={modal === 'add_batch'}
        onClose={closeModal}
        onSubmit={async name => {
          if (!academyId || isCreatingBatch) {
            closeModal();
            return;
          }
          try {
            setIsCreatingBatch(true);
            await academyService.createBatch(academyId, { name });
            await loadBatches();
          } catch (err) {
            console.warn('Failed to create batch:', err);
          } finally {
            setIsCreatingBatch(false);
            closeModal();
          }
        }}
      />

      <AddPlayerModal
        isVisible={modal === 'add_player'}
        batchOptions={batchNames}
        initialBatch={activeBatch?.name}
        onClose={closeModal}
        onSubmit={async ({ playerId, batch }) => {
          const target = batches.find(b => b.name === batch);
          if (academyId && target) {
            try {
              await academyService.assignPlayerToBatch(
                academyId,
                target.id,
                playerId,
              );
              await Promise.all([loadBatches(), loadUnassignedPlayers()]);
            } catch (err) {
              console.warn('Failed to assign player to batch:', err);
            }
          }
          closeModal();
        }}
      />

      <DeletePlayerModal
        isVisible={modal === 'delete_player' && pendingDeletePlayer !== null}
        playerName={pendingDeletePlayer?.player.name ?? ''}
        playerMeta={`${pendingDeletePlayer?.player.athleteCode ?? ''} · ${
          pendingDeletePlayer?.player.sessions ?? 0
        } Session`}
        batchName={pendingDeletePlayer?.batch.name ?? ''}
        avatarUrl={pendingDeletePlayer?.player.avatarUrl}
        onClose={() => {
          setPendingDeletePlayer(null);
          closeModal();
        }}
        onConfirm={async () => {
          if (!pendingDeletePlayer) return;
          if (academyId && !isDeletingPlayer) {
            const batchId = pendingDeletePlayer.batch.id;
            try {
              setIsDeletingPlayer(true);
              await academyService.removeBatchPlayer(
                academyId,
                batchId,
                pendingDeletePlayer.player.linkId,
              );
              await Promise.all([
                loadBatches(),
                fetchBatchPlayers(batchId),
                loadUnassignedPlayers(),
              ]);
            } catch (err) {
              console.warn('Failed to delete player:', err);
            } finally {
              setIsDeletingPlayer(false);
            }
          } else {
            onDeletePlayer?.(pendingDeletePlayer.player.id);
          }
          setPendingDeletePlayer(null);
          closeModal();
        }}
      />

      <ChangeBatchModal
        isVisible={
          modal === 'change_batch' && pendingChangeBatchPlayer !== null
        }
        title="Change Batch"
        playerName={pendingChangeBatchPlayer?.player.name ?? ''}
        playerMeta={`${pendingChangeBatchPlayer?.player.athleteCode ?? ''} · ${
          pendingChangeBatchPlayer?.batch.name ?? ''
        }`}
        currentBatch={pendingChangeBatchPlayer?.batch.name ?? ''}
        batchOptions={batchNames}
        avatarUrl={pendingChangeBatchPlayer?.player.avatarUrl}
        onClose={() => {
          setPendingChangeBatchPlayer(null);
          closeModal();
        }}
        onSave={async newBatchName => {
          if (!pendingChangeBatchPlayer) return;
          const sourceBatchId = pendingChangeBatchPlayer.batch.id;
          const targetBatch = batches.find(b => b.name === newBatchName);
          if (academyId && targetBatch && !isMovingPlayer) {
            try {
              setIsMovingPlayer(true);
              await academyService.movePlayerBatch(
                academyId,
                pendingChangeBatchPlayer.player.id,
                targetBatch.id,
              );
              // Only the source batch (the open accordion) needs its players
              // refreshed; the target batch loads its players when opened.
              await Promise.all([
                loadBatches(),
                fetchBatchPlayers(sourceBatchId),
              ]);
            } catch (err) {
              console.warn('Failed to move player:', err);
            } finally {
              setIsMovingPlayer(false);
            }
          }
          setPendingChangeBatchPlayer(null);
          closeModal();
        }}
      />

      <PlayerStatsScreen
        isVisible={selectedPlayerForStats !== null}
        cricId={selectedPlayerForStats?.cricId ?? ''}
        playerName={selectedPlayerForStats?.name ?? ''}
        onBack={() => setSelectedPlayerForStats(null)}
      />
    </>
  );
};
