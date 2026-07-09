import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeftIcon,
  CaretDownIcon,
  RocketLaunchIcon,
  VideoIcon,
  ChartBarIcon,
  UsersIcon,
  ScanIcon,
  StarIcon,
  LockIcon,
  EnvelopeSimpleIcon,
} from 'phosphor-react-native';
import { colors } from '../../../theme/colors';
import { useHeaderAnimation } from '../../../hooks/useHeaderAnimation';
import { styles } from './styles';

interface QA {
  q: string;
  a: string;
}

interface SectionData {
  id: string;
  title: string;
  IconComponent: React.ComponentType<any>;
  qas: QA[];
}

const SECTIONS: SectionData[] = [
  {
    id: 'getting_started',
    title: 'Getting Started',
    IconComponent: RocketLaunchIcon,
    qas: [
      {
        q: 'How do I record my first training session?',
        a: 'Go to the Home tab and tap the record button. Set up your camera facing the pitch, then tap Start Session.',
      },
      {
        q: 'What is the ball tracker and how does it work?',
        a: 'CrickRoo uses on-device ML to detect and track cricket balls in real time during your session.',
      },
      {
        q: 'How do I set up my cricket profile?',
        a: 'Go to Settings → Profile Details → Cricket Profile. You can set your role, batting hand, and bowling arm.',
      },
      {
        q: 'How do I link to my coach?',
        a: 'Go to Settings → Coach Details → Link to a Coach and enter the coach code your coach provides.',
      },
    ],
  },
  {
    id: 'session_recording',
    title: 'Session Recording & Analysis',
    IconComponent: VideoIcon,
    qas: [
      {
        q: "Why isn't the ball tracker detecting balls?",
        a: 'Ensure good lighting, a stable camera position at a slight angle to the pitch, and a contrasting ball against the pitch surface.',
      },
      {
        q: 'What camera position works best?',
        a: 'Mount the camera at mid-on or mid-off, roughly 10–15 metres back and at hip height, facing down the pitch.',
      },
      {
        q: 'How do I view my pitch map and release points?',
        a: 'Open any completed session from the Stats or Home tab to see the full pitch map and release point charts.',
      },
      {
        q: 'What do the speed distribution charts mean?',
        a: 'They show the range of delivery speeds across your session, helping identify consistency and outliers.',
      },
      {
        q: 'How do I generate a session highlight reel?',
        a: 'After a session ends, tap "Create Reel" on the Session Summary screen and select the deliveries you want.',
      },
    ],
  },
  {
    id: 'stats_performance',
    title: 'Stats & Performance',
    IconComponent: ChartBarIcon,
    qas: [
      {
        q: 'What stats are tracked for batsmen vs. bowlers?',
        a: 'Batsmen see shot placement and scoring zones. Bowlers see pitch maps, release points, and speed distribution.',
      },
      {
        q: 'How is my session history stored?',
        a: 'Sessions are stored in the cloud linked to your account and accessible from the Home tab.',
      },
      {
        q: 'Can I compare stats across sessions?',
        a: 'Session-by-session comparison is on the roadmap. Currently each session shows its own analytics.',
      },
      {
        q: 'Why are my stats not updating after a session?',
        a: 'Pull down to refresh on the Stats screen. If the issue persists, check your internet connection and contact support.',
      },
    ],
  },
  {
    id: 'coach_player_features',
    title: 'Coach & Player Features',
    IconComponent: UsersIcon,
    qas: [
      {
        q: 'How do I switch between Coach Mode and Player Mode?',
        a: 'Go to Settings → Account Type and tap SWITCH to toggle between modes.',
      },
      {
        q: 'How do I add players to a batch?',
        a: 'In Coach Mode, open the Batches section on the Home tab and tap "Add Players" inside a batch.',
      },
      {
        q: 'How do players link using a coach code?',
        a: 'Share your coach code (Settings → Subscription → Your Coach Code) with players. They enter it under Settings → Coach Details → Link to a Coach.',
      },
      {
        q: 'How do I monitor team performance?',
        a: 'In Coach Mode, open any batch from the Home tab to see individual and team performance summaries.',
      },
    ],
  },
  {
    id: 'face_recognition',
    title: 'Face Recognition & Biometrics',
    IconComponent: ScanIcon,
    qas: [
      {
        q: 'Why do I need to add facial images?',
        a: 'Face recognition is used to automatically identify which player is batting or bowling during group sessions.',
      },
      {
        q: 'How is my biometric data stored?',
        a: 'Facial data is encrypted and stored securely in the cloud, used only for player identification within your sessions.',
      },
      {
        q: 'How do I update my face recognition data?',
        a: 'Go to Settings → Profile Details → Face Recognition to add, update, or remove your facial images.',
      },
    ],
  },
  {
    id: 'subscription_plans',
    title: 'Subscription & Plans',
    IconComponent: StarIcon,
    qas: [
      {
        q: "What's included in the Free Plan?",
        a: '5 sessions per month with access to basic pitch maps and session summaries.',
      },
      {
        q: 'How do I upgrade my plan?',
        a: 'Tap the UPGRADE button on the Settings screen to view available plans.',
      },
      {
        q: 'How do I enter a license code?',
        a: 'Go to Settings → Subscription → Enter License Code and type in the code provided by your academy or club.',
      },
      {
        q: 'What happens when I hit my session limit?',
        a: "You'll receive a notification and won't be able to start new sessions until the next month or until you upgrade.",
      },
    ],
  },
  {
    id: 'account_privacy',
    title: 'Account & Privacy',
    IconComponent: LockIcon,
    qas: [
      {
        q: 'How do I change my profile details?',
        a: 'Go to Settings → Profile Details → Personal Profile to edit your name, date of birth, height, and weight.',
      },
      {
        q: 'How do I manage app permissions?',
        a: 'Go to Settings → Profile Details → App Permissions to control camera, microphone, and location access.',
      },
      {
        q: 'How do I delete my account?',
        a: 'Scroll to the bottom of Settings and tap Delete Account. This is permanent and cannot be undone.',
      },
      {
        q: 'How do I log out securely?',
        a: 'Scroll to the bottom of Settings and tap Log Out.',
      },
    ],
  },
];

interface AccordionItemProps {
  section: SectionData;
  isExpanded: boolean;
  onToggle: () => void;
}

const AccordionItem: React.FC<AccordionItemProps> = ({
  section,
  isExpanded,
  onToggle,
}) => {
  const rotation = useSharedValue(isExpanded ? 180 : 0);
  const animationProgress = useSharedValue(isExpanded ? 1 : 0);
  const [bodyHeight, setBodyHeight] = useState(0);

  useEffect(() => {
    rotation.value = withTiming(isExpanded ? 180 : 0, { duration: 250 });
    animationProgress.value = withTiming(isExpanded ? 1 : 0, { duration: 250 });
  }, [isExpanded, rotation, animationProgress]);

  const caretStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const bodyStyle = useAnimatedStyle(() => ({
    height: bodyHeight * animationProgress.value,
    opacity: animationProgress.value,
  }));

  const { IconComponent, title, qas } = section;

  return (
    <View style={styles.accordionCard}>
      <TouchableOpacity
        onPress={onToggle}
        style={styles.accordionHeader}
        activeOpacity={0.7}
      >
        <IconComponent size={20} color={colors.neutrals.white} />
        <Text style={styles.accordionTitle}>{title}</Text>
        <Animated.View style={caretStyle}>
          <CaretDownIcon size={18} color={colors.neutrals[40]} />
        </Animated.View>
      </TouchableOpacity>

      <Animated.View style={[styles.accordionBody, bodyStyle]}>
        <View
          style={styles.accordionBodyInner}
          onLayout={e => {
            const h = e.nativeEvent.layout.height;
            if (h > 0 && h !== bodyHeight) {
              setBodyHeight(h);
            }
          }}
        >
          {qas.map((qa, index) => (
            <React.Fragment key={index}>
              {index > 0 && <View style={styles.divider} />}
              <View style={styles.qaItem}>
                <Text style={styles.questionText}>{qa.q}</Text>
                <Text style={styles.answerText}>{qa.a}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>
      </Animated.View>
    </View>
  );
};

interface HelpSupportScreenProps {
  onBack: () => void;
}

export const HelpSupportScreen: React.FC<HelpSupportScreenProps> = ({
  onBack,
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const { headerStyle } = useHeaderAnimation();

  const handleEmailSupport = async () => {
    const email = 'vedantkabra@athmech.com';
    const url = `mailto:${email}`;
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('Email Support', `Please email us at: ${email}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.header, headerStyle]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ArrowLeftIcon size={24} color={colors.neutrals.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
      </Animated.View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {SECTIONS.map(section => (
          <AccordionItem
            key={section.id}
            section={section}
            isExpanded={expandedSection === section.id}
            onToggle={() =>
              setExpandedSection(
                expandedSection === section.id ? null : section.id,
              )
            }
          />
        ))}

        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>Still need help?</Text>
          <Text style={styles.contactSubtitle}>
            Our support team is here for you
          </Text>
          <TouchableOpacity
            style={styles.emailButton}
            onPress={handleEmailSupport}
            activeOpacity={0.8}
          >
            <EnvelopeSimpleIcon size={20} color={colors.neutrals.black} />
            <Text style={styles.emailButtonText}>Email Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
