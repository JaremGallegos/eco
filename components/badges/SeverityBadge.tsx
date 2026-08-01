import { Colors } from '@/constants/theme';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

interface SeverityBadgeProps {
  severity: string;
  style?: ViewStyle;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity, style }) => {
  const getBackgroundColor = () => {
    const severityLower = severity.toLowerCase();
    if (severityLower === 'critica' || severityLower === 'crítica') return Colors.severityCritical;
    if (severityLower === 'alta') return Colors.severityHigh;
    if (severityLower === 'media') return Colors.severityMedium;
    if (severityLower === 'baja') return Colors.severityLow;
    return Colors.gray500;
  };

  return (
    <View style={[styles.container, { backgroundColor: getBackgroundColor() }, style]}>
      <Text style={styles.text}>{severity}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    color: Colors.white,
    fontWeight: '700',
  },
});
