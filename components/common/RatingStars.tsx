import { Colors, Spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

interface RatingStarsProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  size?: number;
  filledColor?: string;
  emptyColor?: string;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  onRatingChange,
  size = 40,
  filledColor = Colors.warning,
  emptyColor = Colors.gray300,
}) => {
  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map((star) => (
        <StarButton
          key={star}
          filled={star <= rating}
          onPress={() => onRatingChange(star)}
          size={size}
          filledColor={filledColor}
          emptyColor={emptyColor}
        />
      ))}
    </View>
  );
};

interface StarButtonProps {
  filled: boolean;
  onPress: () => void;
  size: number;
  filledColor: string;
  emptyColor: string;
}

function StarButton({ filled, onPress, size, filledColor, emptyColor }: StarButtonProps) {
  const scale = useSharedValue(1);

  const handlePress = () => {
    scale.value = withSequence(
      withSpring(1.2, { damping: 10 }),
      withSpring(1, { damping: 10 })
    );
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      <Animated.View style={[styles.star, animatedStyle]}>
        <Ionicons
          name={filled ? 'star' : 'star-outline'}
          size={size}
          color={filled ? filledColor : emptyColor}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  star: {
    padding: 4,
  },
});
