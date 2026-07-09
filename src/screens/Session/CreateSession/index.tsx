import React, { useState, useEffect } from 'react';
import { ScrollView, Text, ActivityIndicator, View } from 'react-native';
import { BaseAuthLayout } from '../../../components/auth/BaseAuthLayout';
import { SearchInput } from '../../../components/common/SearchInput';
import { SessionCard } from '../../../components/common/Cards';
import { Button } from '../../../components/common/Button';
import { UserCircleIcon } from 'phosphor-react-native';
import { sessionService } from '../../../services/session.service';
import { Session, PlayerResponse } from '../../../types/session';
import { colors } from '../../../theme/colors';
import { formatDate } from '../../../utils/date';
import { styles } from './styles';

interface CreateSessionScreenProps {
  onBack: () => void;
  onCreateNew: () => void;
  onSelectSession: (id: string, pitchLength: number) => void;
}

export const CreateSessionScreen: React.FC<CreateSessionScreenProps> = ({
  onBack,
  onCreateNew,
  onSelectSession,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      const data = await sessionService.getSessions();
      setSessions(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError('Failed to load previous sessions');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSessions = sessions.filter(
    session =>
      session.sessionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.sessionType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.mode.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <BaseAuthLayout
      title="Create Session"
      onBack={onBack}
      headerVariant="standard"
      footer={
        <Button
          label="CREATE NEW SESSION"
          onPress={onCreateNew}
          variant="primary"
        />
      }
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionHeader}>PREVIOUS SESSIONS</Text>

        <SearchInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchBar}
        />

        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator color={colors.primary.main} size="large" />
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Button
              label="RETRY"
              onPress={fetchSessions}
              style={styles.retryButton}
              textStyle={styles.retryButtonText}
            />
          </View>
        ) : filteredSessions.length === 0 ? (
          <Text style={styles.emptyText}>No previous sessions found</Text>
        ) : (
          filteredSessions.map(session => (
            <SessionCard
              key={session.sessionId}
              title={`${session.sessionName}, ${formatDate(session.createdAt)}`}
              subtitle={`${
                session.sessionType.charAt(0).toUpperCase() +
                session.sessionType.slice(1)
              } • ${
                session.mode.charAt(0).toUpperCase() + session.mode.slice(1)
              } • ${session.pitchLength} yards pitch`}
              participants={session.players.map(
                (p: PlayerResponse) => p.player_name,
              )}
              participantAvatars={session.players.map(() => (
                <UserCircleIcon size={24} color={colors.neutrals[40]} />
              ))}
              onDuplicate={() => console.log('Duplicate', session.sessionId)}
              onPress={() =>
                onSelectSession(session.sessionId, session.pitchLength)
              }
            />
          ))
        )}
      </ScrollView>
    </BaseAuthLayout>
  );
};
