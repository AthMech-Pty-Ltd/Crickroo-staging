import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckCircleIcon, XIcon } from 'phosphor-react-native';
import { colors } from '../../theme/colors';
import { styles } from './styles';
import UploadManager, { SessionStats } from '../../services/upload';
import { Button } from '../../components/common/Button';

interface SessionSummaryScreenProps {
  sessionId: string;
  duration: number; // in seconds
  onDone: () => void;
  onClose: () => void;
}

export const SessionSummaryScreen: React.FC<SessionSummaryScreenProps> = ({
  sessionId,
  duration,
  onDone,
  onClose,
}) => {
  const [stats, setStats] = useState<SessionStats>({ uploaded: 0, total: 0 });

  useEffect(() => {
    // Subscribe to upload progress for this session
    const unsubscribe = UploadManager.onSessionProgress(sessionId, newStats => {
      setStats(newStats);
    });

    return () => unsubscribe();
  }, [sessionId]);

  const progress = stats.total > 0 ? stats.uploaded / stats.total : 0;
  const isComplete = stats.total > 0 && stats.uploaded === stats.total;

  // Debug logging to help identify why the bar isn't moving
  console.log(
    `[SummaryScreen] Session ${sessionId} Progress: ${stats.uploaded}/${
      stats.total
    } (${(progress * 100).toFixed(0)}%)`,
  );

  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  const timeDisplay =
    minutes > 0
      ? `${minutes} min${minutes > 1 ? 's' : ''}`
      : `${seconds} seconds`;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <XIcon size={24} color={colors.neutrals.white} />
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <View style={styles.wellDoneCard}>
          <View style={styles.checkCircle}>
            <CheckCircleIcon
              size={100}
              color={colors.success.main}
              weight="regular"
            />
          </View>
          <Text style={styles.wellDoneTitle}>Well Done!</Text>
          <Text style={styles.wellDoneSubtitle}>
            You've trained for {timeDisplay}
          </Text>
        </View>

        <View style={styles.processingCard}>
          <Text style={styles.processingTitle}>
            {isComplete ? 'Session Synced!' : 'Processing Your Session...'}
          </Text>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.max(progress * 100, 2)}%` }, // Min 2% visibility
              ]}
            />
          </View>

          <Text style={styles.detectingTitle}>Detecting Players...</Text>

          <View style={styles.divider} />

          <Text style={styles.infoText}>
            We're identifying players using Face Id. You'll be notified when
            your session is ready.
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        {isComplete && (
          <Button label="DONE" onPress={onDone} variant="primary" />
        )}
      </View>
    </SafeAreaView>
  );
};
