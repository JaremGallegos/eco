import { BorderRadius, Spacing, Typography } from '@/constants/theme';
import { getStatusColor, getStatusIcon, getStatusLabel, withOpacity } from '@/src/utils/styles';
import { Ionicons } from '@expo/vector-icons';
import React, { memo } from 'react';
import { StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';

interface StatusBadgeProps {
  status: string;
  showIcon?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge = memo(function StatusBadge({
  status,
  showIcon = false,
  containerStyle,
  textStyle,
  size = 'md',
}: StatusBadgeProps) {
  const statusColor = getStatusColor(status);
  const statusIcon = getStatusIcon(status);
  const statusLabel = getStatusLabel(status);

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
        { backgroundColor: withOpacity(statusColor, 0.15), borderColor: statusColor },
        containerStyle,
      ]}
    >
      {showIcon && (
        <Ionicons
          name={statusIcon as any}
          size={sizeStyles.icon}
          color={statusColor}
          style={styles.icon}
        />
      )}
      <Text style={[styles.text, sizeStyles.text, { color: statusColor }, textStyle]}>
        {statusLabel}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
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
