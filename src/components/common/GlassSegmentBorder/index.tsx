import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface GlassSegmentBorderProps {
  radius?: number;
  stroke?: string;
  highlightStroke?: string;
}

export const GlassSegmentBorder: React.FC<GlassSegmentBorderProps> = ({
  stroke = '#FFFFFF4D',
  highlightStroke = '#FFFFFF66',
}) => {
  return (
    <View pointerEvents="none" style={styles.overlay}>
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <Path
          d="M 8 1 H 95 M 8 1 C 3.5 1 1 5 1 12 V 80"
          fill="none"
          stroke={stroke}
          strokeWidth={1.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        <Path
          d="M 8 1 C 3.5 1 1 5 1 17"
          fill="none"
          stroke={highlightStroke}
          strokeWidth={1.05}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        <Path
          d="M 99 24 V 87 C 99 96 95.5 99 92 99 H 6"
          fill="none"
          stroke={stroke}
          strokeWidth={1.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        <Path
          d="M 99 87 C 99 96 95.5 99 92 99"
          fill="none"
          stroke={highlightStroke}
          strokeWidth={1.05}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </Svg>
    </View>
  );
};

export const GlassCornerBorder: React.FC<GlassSegmentBorderProps> = ({
  stroke = '#FFFFFF4D',
  highlightStroke = '#FFFFFF66',
}) => {
  return (
    <View pointerEvents="none" style={styles.overlay}>
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <Path
          d="M 8 1 H 92 C 96.5 1 99 5 99 12"
          fill="none"
          stroke={stroke}
          strokeWidth={1.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
          <Path
            d="M 8 1 C 4.5 1 2 3.5 1.5 8"
            fill="none"
            stroke={highlightStroke}
            strokeWidth={1.05}
            strokeLinecap="round"
            strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
          <Path
            d="M 1 88 C 1 96 3.5 99 8 99 H 92 C 96.5 99 99 96 98.5 92"
            fill="none"
            stroke={stroke}
            strokeWidth={1.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
          <Path
            d="M 98.5 92 C 98.5 96 96 99 92 99"
            fill="none"
            stroke={highlightStroke}
            strokeWidth={1.05}
            strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
});
