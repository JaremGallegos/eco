import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import * as Haptics from 'expo-haptics';
import React, { memo, useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';

interface AnimatedButtonProps {
  onPress?: (event: any) => void;
  disabled?: boolean;
  variant?: ButtonVariant;
  buttonStyle?: StyleProp<ViewStyle>;
  disabledStyle?: StyleProp<ViewStyle>;
  title?: string;
  titleStyle?: StyleProp<TextStyle>;
  icon?: React.ReactNode;
  iconRight?: boolean;
  loading?: boolean;
  loadingProps?: any;
  hapticFeedback?: boolean;
  animationScale?: number;
  containerStyle?: StyleProp<ViewStyle>;
  iconContainerStyle?: StyleProp<ViewStyle>;
}

export const AnimatedButton = memo(function AnimatedButton({
  hapticFeedback = true,
  animationScale = 0.96,
  variant = 'primary',
  onPress,
  disabled,
  buttonStyle,
  disabledStyle,
  title,
  titleStyle,
  icon,
  iconRight,
  loading,
  iconContainerStyle,
  ...props
}: AnimatedButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (disabled || loading) return;

    scale.value = withSpring(animationScale, {
      damping: 20,
      stiffness: 400,
      mass: 0.5,
    });
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePressOut = () => {
    if (disabled || loading) return;

    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 350,
      mass: 0.5,
    });
  };

  const handlePress = (e: any) => {
    if (disabled || loading) return;

    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPress?.(e);
  };


  const computedButtonStyle = useMemo(() => {
    const variantStyle = {
      primary: styles.buttonPrimary,
      secondary: styles.buttonSecondary,
      outline: styles.buttonOutline,
      ghost: styles.buttonGhost,
    }[variant];

    if (disabled) {
      return [styles.button, variantStyle, buttonStyle, styles.disabled, disabledStyle];
    }
    return [styles.button, variantStyle, buttonStyle];
  }, [disabled, variant, buttonStyle, disabledStyle]);


  const computedTitleStyle = useMemo(() => {
    const variantTitleStyle = {
      primary: styles.titlePrimary,
      secondary: styles.titleSecondary,
      outline: styles.titleOutline,
      ghost: styles.titleGhost,
    }[variant];

    return [styles.title, variantTitleStyle, titleStyle];
  }, [variant, titleStyle]);


  const getLoadingColor = () => {
    if (variant === 'outline' || variant === 'ghost') {
      return Colors.primary;
    }
    return '#fff';
  };

  return (
    <AnimatedPressable
      style={[animatedStyle, computedButtonStyle]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={getLoadingColor()} />
      ) : (
        <View style={styles.contentContainer}>
          {icon && !iconRight && <View style={[styles.iconLeft, iconContainerStyle]}>{icon}</View>}
          {title && <Text style={computedTitleStyle}>{title}</Text>}
          {icon && iconRight && <View style={[styles.iconRight, iconContainerStyle]}>{icon}</View>}
        </View>
      )}
    </AnimatedPressable>
  );
});

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    minHeight: 48,
  },
  buttonPrimary: {
    backgroundColor: Colors.primary,
  },
  buttonSecondary: {
    backgroundColor: Colors.secondary,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  buttonGhost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    backgroundColor: Colors.gray300,
    opacity: 0.6,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    textAlign: 'center',
  },
  titlePrimary: {
    color: '#fff',
  },
  titleSecondary: {
    color: '#fff',
  },
  titleOutline: {
    color: Colors.primary,
  },
  titleGhost: {
    color: Colors.primary,
  },
  iconLeft: {
    marginRight: Spacing.sm,
  },
  iconRight: {
    marginLeft: Spacing.sm,
  },
});


