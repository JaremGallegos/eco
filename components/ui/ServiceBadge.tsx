import { BorderRadius, Spacing, Typography } from '@/constants/theme';
import { getServiceBackgroundColor, getServiceColor, getServiceIcon } from '@/src/utils/styles';
import { Ionicons } from '@expo/vector-icons';
import React, { memo } from 'react';
import { StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';

interface ServiceBadgeProps {
  serviceType: string;
  showIcon?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  size?: 'sm' | 'md' | 'lg';
}

export const ServiceBadge = memo(function ServiceBadge({
  serviceType,
  showIcon = true,
  containerStyle,
  textStyle,
  size = 'md',
}: ServiceBadgeProps) {
  const serviceColor = getServiceColor(serviceType);
  const serviceIcon = getServiceIcon(serviceType);
  const backgroundColor = getServiceBackgroundColor(serviceType);


  const serviceTypeLower = serviceType.toLowerCase();
  const serviceLabel = serviceTypeLower === 'agua' || serviceTypeLower === 'water' ? 'Agua' : 'Luz';

  const sizeStyles = {
    sm: { container: styles.containerSm, text: styles.textSm, icon: 12 },
    md: { container: styles.containerMd, text: styles.textMd, icon: 14 },
    lg: { container: styles.containerLg, text: styles.textLg, icon: 16 },
  }[size];

  return (
    <View
      style={[
        styles.container,
        sizeStyles.container,
        { backgroundColor },
        containerStyle,
      ]}
    >
      {showIcon && (
        <Ionicons
          name={serviceIcon as any}
          size={sizeStyles.icon}
          color={serviceColor}
          style={styles.icon}
        />
      )}
      <Text style={[styles.text, sizeStyles.text, { color: serviceColor }, textStyle]}>
        {serviceLabel}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: BorderRadius.md,
  },
  containerSm: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  containerMd: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
  },
  containerLg: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  icon: {
    marginRight: Spacing.xs,
  },
  text: {
    fontWeight: Typography.weights.semibold,
  },
  textSm: {
    fontSize: Typography.sizes.xs,
  },
  textMd: {
    fontSize: Typography.sizes.sm,
  },
  textLg: {
    fontSize: Typography.sizes.base,
  },
});
