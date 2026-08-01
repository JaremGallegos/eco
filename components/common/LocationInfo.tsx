import { Colors, Spacing, Typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface LocationInfoProps {
  location: {
    district?: string;
    zone?: string;
    postalCode?: string;
    address?: string;
    latitude: number;
    longitude: number;
  };
  showCoords?: boolean;
}

export const LocationInfo: React.FC<LocationInfoProps> = ({
  location,
  showCoords = true
}) => {
  return (
    <View style={styles.container}>
      {location.district && (
        <View style={styles.row}>
          <Ionicons name="business" size={16} color={Colors.primary} />
          <Text style={styles.text}>{location.district}</Text>
        </View>
      )}

      {location.zone && (
        <View style={styles.row}>
          <Ionicons name="navigate" size={16} color={Colors.primary} />
          <Text style={styles.text}>{location.zone}</Text>
        </View>
      )}

      {location.postalCode && (
        <View style={styles.row}>
          <Ionicons name="pricetag" size={16} color={Colors.primary} />
          <Text style={styles.text}>{location.postalCode}</Text>
        </View>
      )}

      {location.address && (
        <View style={styles.row}>
          <Ionicons name="map" size={16} color={Colors.primary} />
          <Text style={styles.text}>{location.address}</Text>
        </View>
      )}

      {showCoords && (
        <View style={styles.row}>
          <Ionicons name="pin" size={16} color={Colors.textGray} />
          <Text style={styles.coordsText}>
            {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  text: {
    fontSize: Typography.sizes.sm,
    color: Colors.light.text,
    marginLeft: Spacing.md,
    fontWeight: Typography.weights.medium,
    flex: 1,
  },
  coordsText: {
    fontSize: Typography.sizes.sm,
    color: Colors.gray600,
    marginLeft: Spacing.md,
    fontWeight: Typography.weights.regular,
    fontFamily: 'monospace',
    flex: 1,
  },
});
