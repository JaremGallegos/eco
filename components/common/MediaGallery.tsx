import { BorderRadius, Spacing } from '@/constants/theme';
import { Image } from 'expo-image';
import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface MediaGalleryProps {
  media: string[];
  columns?: number;
  delay?: number;
}

export const MediaGallery: React.FC<MediaGalleryProps> = ({
  media,
  columns = 3,
  delay = 0
}) => {
  const mediaSize = (width - (Spacing.lg * 2) - (Spacing.md * (columns - 1))) / columns;

  return (
    <View style={styles.container}>
      {media.map((uri, index) => (
        <AnimatedMediaItem
          key={index}
          uri={uri}
          size={mediaSize}
          delay={delay + index * 50}
        />
      ))}
    </View>
  );
};

interface AnimatedMediaItemProps {
  uri: string;
  size: number;
  delay: number;
}

const AnimatedMediaItem: React.FC<AnimatedMediaItemProps> = ({ uri, size, delay }) => {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      opacity.value = 1;
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Image
        source={{ uri }}
        style={[styles.mediaImage, { width: size, height: size }]}
        contentFit="cover"
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  mediaImage: {
    borderRadius: BorderRadius.md,
  },
});
