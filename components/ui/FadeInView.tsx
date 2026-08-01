import React, { memo, useEffect } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

interface FadeInViewProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  style?: StyleProp<ViewStyle>;
}

export const FadeInView = memo(function FadeInView({
  children,
  delay = 0,
  duration = 600,
  direction = 'up',
  style,
}: FadeInViewProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(direction === 'up' ? 20 : direction === 'down' ? -20 : 0);
  const translateX = useSharedValue(direction === 'left' ? 20 : direction === 'right' ? -20 : 0);

  useEffect(() => {
    const timer = setTimeout(() => {
      opacity.value = withTiming(1, {
        duration,
        easing: Easing.out(Easing.cubic),
      });
      if (direction !== 'none') {
        translateY.value = withSpring(0, { damping: 20, stiffness: 120 });
        translateX.value = withSpring(0, { damping: 20, stiffness: 120 });
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, duration, direction]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
    ],
  }));

  return <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>;
});
