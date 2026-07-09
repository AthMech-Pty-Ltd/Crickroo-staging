import React from 'react';
import { View, Text, Image } from 'react-native';
import {
  BALL_POSITIONS,
  DELIVERY_LABELS as LABELS,
} from '../../../constants/pitchData';

import { styles } from './styles';
import { ASSETS } from '../../../constants/assets';

export const PitchMap: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>CrickRoo</Text>
          </View>
        </View>

        <View style={styles.mapWrapper}>
          <Image
            source={ASSETS.IMAGES.PITCH}
            style={styles.pitchImage}
            resizeMode="cover"
          />

          <View style={styles.overlayLayer}>
            {BALL_POSITIONS.map((pos, idx) => (
              <View key={idx} style={[styles.ball, pos]} />
            ))}
          </View>

          <View style={styles.labelsContainer}>
            {LABELS.map((label, idx) => (
              <View
                key={idx}
                style={[
                  styles.labelBox,
                  styles[label.style as keyof typeof styles],
                ]}
              >
                <Text style={styles.labelText}>{label.value}</Text>
                <Text style={styles.labelTitle}>{label.title}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            GLENN - ALL BALLS LAST 10 SESSIONS
          </Text>
        </View>
      </View>

      <View style={styles.pagination}>
        <View style={[styles.dot, styles.activeDot]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>
    </View>
  );
};
