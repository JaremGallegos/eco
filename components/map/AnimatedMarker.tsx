import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

interface AnimatedMarkerProps {
  type: string;
}

export const AnimatedMarker: React.FC<AnimatedMarkerProps> = ({ type }) => {
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 12 });
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isWater = type === 'agua';
  const backgroundColor = isWater ? Colors.waterLight : Colors.electricLight;
  const iconName = isWater ? 'water' : 'flash';
  const arrowColor = isWater ? Colors.waterLight : Colors.electricLight;

  return (
    <Animated.View style={[style, styles.markerWrapper]}>
      <View style={[styles.markerPin, { backgroundColor }]}>
        <Ionicons name={iconName} size={14} color={Colors.white} />
      </View>
      <View style={[styles.markerArrow, { borderTopColor: arrowColor }]} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  markerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
  },
  markerPin: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
    shadowColor: Colors.gray900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
    zIndex: 2,
  },
  markerArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -2,
    zIndex: 1,
  },
});
