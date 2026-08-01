import { Colors, Spacing, Typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface DateInfoProps {
  createdAt: string;
  updatedAt?: string;
}

export const DateInfo: React.FC<DateInfoProps> = ({ createdAt, updatedAt }) => {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Ionicons name="create" size={20} color={Colors.primary} />
        <View style={styles.textContainer}>
          <Text style={styles.label}>Creado</Text>
          <Text style={styles.text}>
            {new Date(createdAt).toLocaleString('es-ES')}
          </Text>
        </View>
      </View>

      {updatedAt && (
        <View style={styles.row}>
          <Ionicons name="refresh" size={20} color={Colors.primary} />
          <View style={styles.textContainer}>
            <Text style={styles.label}>Actualizado</Text>
            <Text style={styles.text}>
              {new Date(updatedAt).toLocaleString('es-ES')}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: Typography.sizes.xs,
    color: Colors.gray600,
    fontWeight: Typography.weights.medium,
    marginBottom: 4,
  },
  text: {
    fontSize: Typography.sizes.md,
    color: Colors.textDark,
    fontWeight: Typography.weights.semibold,
    lineHeight: 20,
  },
});
