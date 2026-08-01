import { BorderRadius, Colors, Shadows, Spacing } from '@/constants/theme';
import React, { memo, useEffect } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

interface AnimatedCardProps {
  children: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  delay?: number;
  glassmorphism?: boolean;
  shadowLevel?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'outlined';
  onPress?: () => void;
}

export const AnimatedCard = memo(function AnimatedCard({
  children,
  containerStyle,
  delay = 0,
  glassmorphism = false,
  shadowLevel = 'md',
  variant = 'default',
  onPress,
}: AnimatedCardProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);
  const scale = useSharedValue(0.92);

  useEffect(() => {
    const timer = setTimeout(() => {
      opacity.value = withTiming(1, {
        duration: 500,
        easing: Easing.out(Easing.cubic),
      });
      translateY.value = withSpring(0, {
        damping: 20,
        stiffness: 120,
        mass: 0.8,
      });
      scale.value = withSpring(1, {
        damping: 18,
        stiffness: 140,
        mass: 0.8,
      });
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  const getShadowStyle = () => {
    if (shadowLevel === 'none') return null;
    return Shadows[shadowLevel];
  };

  const cardStyles = [
    styles.card,
    getShadowStyle(),
    variant === 'outlined' && styles.outlined,
    glassmorphism && styles.glassmorphism,
    containerStyle,
  ];

  return (
    <Animated.View style={animatedStyle}>
      <View style={cardStyles}>
        {children}
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.card,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  outlined: {
    borderWidth: 1,
    borderColor: Colors.gray300,
  },
  glassmorphism: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
});

