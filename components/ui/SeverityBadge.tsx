import { BorderRadius, Spacing, Typography } from '@/constants/theme';
import { getSeverityColor, getSeverityIcon, withOpacity } from '@/src/utils/styles';
import { Ionicons } from '@expo/vector-icons';
import React, { memo } from 'react';
import { StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';

interface SeverityBadgeProps {
  severity: string;
  showIcon?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  size?: 'sm' | 'md' | 'lg';
}

export const SeverityBadge = memo(function SeverityBadge({
  severity,
  showIcon = true,
  containerStyle,
  textStyle,
  size = 'md',
}: SeverityBadgeProps) {
  const severityColor = getSeverityColor(severity);
  const severityIcon = getSeverityIcon(severity);


  const severityLabel = severity.charAt(0).toUpperCase() + severity.slice(1).toLowerCase();

  const sizeStyles = {
    sm: { container: styles.containerSm, text: styles.textSm, icon: 10 },
    md: { container: styles.containerMd, text: styles.textMd, icon: 12 },
    lg: { container: styles.containerLg, text: styles.textLg, icon: 14 },
  }[size];

  return (
    <View
      style={[
        styles.container,
        sizeStyles.container,
        { backgroundColor: withOpacity(severityColor, 0.15), borderColor: severityColor },
        containerStyle,
      ]}
    >
      {showIcon && (
        <Ionicons
          name={severityIcon as any}
          size={sizeStyles.icon}
          color={severityColor}
          style={styles.icon}
        />
      )}
      <Text style={[styles.text, sizeStyles.text, { color: severityColor }, textStyle]}>
        {severityLabel}
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
    borderRadius: BorderRadius.sm,
  },
  containerSm: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  containerMd: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  containerLg: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
  },
  icon: {
    marginRight: 4,
  },
  text: {
    fontWeight: Typography.weights.semibold,
  },
  textSm: {
    fontSize: 10,
  },
  textMd: {
    fontSize: Typography.sizes.xs,
  },
  textLg: {
    fontSize: Typography.sizes.sm,
  },
});
