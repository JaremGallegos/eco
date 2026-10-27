import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

interface ServiceIconProps {
  serviceType: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  style?: ViewStyle;
}

export const ServiceIcon: React.FC<ServiceIconProps> = ({
  serviceType,
  size = 'md',
  showLabel = true,
  style
}) => {
  const isWater = serviceType === 'AGUA';
  const iconName = isWater ? 'water' : 'flash';
  const iconColor = isWater ? Colors.water : Colors.electric;
  const backgroundColor = isWater ? Colors.waterAlpha : Colors.electricAlpha;

  const sizeMap = {
    sm: { container: 48, icon: 24, text: 16 },
    md: { container: 64, icon: 36, text: 20 },
    lg: { container: 80, icon: 48, text: 24 },
  };

  const dimensions = sizeMap[size];

  return (
    <View style={[styles.wrapper, style]}>
      <View
        style={[
          styles.iconContainer,
          {
            width: dimensions.container,
            height: dimensions.container,
            borderRadius: dimensions.container / 2,
            backgroundColor
          },
        ]}
      >
        <Ionicons name={iconName} size={dimensions.icon} color={iconColor} />
      </View>
      {showLabel && (
        <Text style={[styles.text, { fontSize: dimensions.text }]}>
          {serviceType === 'AGUA' ? 'Agua' : 'Luz'}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  text: {
    color: Colors.primary,
    fontWeight: '700',
  },
});
