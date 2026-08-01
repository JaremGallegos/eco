import { Colors } from '@/constants/theme';
import { getStatusColor, getStatusIcon } from '@/src/utils/styles';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

interface StatusBadgeProps {
  status: string;
  showIcon?: boolean;
  style?: ViewStyle;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  showIcon = true,
  style
}) => {
  const statusColor = getStatusColor(status);
  const statusIcon = getStatusIcon(status);

  return (
    <View style={[styles.container, { backgroundColor: statusColor }, style]}>
      {showIcon && (
        <Ionicons
          name={statusIcon as any}
          size={14}
          color={Colors.white}
          style={styles.icon}
        />
      )}
      <Text style={styles.text}>{status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: 4,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.white,
  },
});
