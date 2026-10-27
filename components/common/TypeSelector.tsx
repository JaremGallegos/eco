import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TypeSelectorProps {
  selectedType: 'AGUA' | 'LUZ' | null;
  onTypeSelect: (type: 'AGUA' | 'LUZ') => void;
}

export const TypeSelector: React.FC<TypeSelectorProps> = ({
  selectedType,
  onTypeSelect,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.typeOption,
          selectedType === 'AGUA' && styles.typeOptionActive,
        ]}
        onPress={() => onTypeSelect('AGUA')}
        activeOpacity={0.8}
      >
        <View
          style={[
            styles.iconContainer,
            selectedType === 'AGUA' && styles.iconContainerActive,
          ]}
        >
          <Ionicons
            name="water"
            size={32}
            color={selectedType === 'AGUA' ? Colors.water : Colors.darkGray}
          />
        </View>
        <Text
          style={[
            styles.typeText,
            selectedType === 'AGUA' && styles.typeTextActive,
          ]}
        >
          Agua
        </Text>
        {selectedType === 'AGUA' && (
          <View style={styles.checkmark}>
            <Ionicons name="checkmark-circle" size={24} color={Colors.water} />
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.typeOption,
          selectedType === 'LUZ' && styles.typeOptionActive,
        ]}
        onPress={() => onTypeSelect('LUZ')}
        activeOpacity={0.8}
      >
        <View
          style={[
            styles.iconContainer,
            selectedType === 'LUZ' && styles.iconContainerActive,
          ]}
        >
          <Ionicons
            name="flash"
            size={32}
            color={selectedType === 'LUZ' ? Colors.electric : Colors.darkGray}
          />
        </View>
        <Text
          style={[
            styles.typeText,
            selectedType === 'LUZ' && styles.typeTextActive,
          ]}
        >
          Luz
        </Text>
        {selectedType === 'LUZ' && (
          <View style={styles.checkmark}>
            <Ionicons name="checkmark-circle" size={24} color={Colors.electric} />
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.light.backgroundAlt,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeOptionActive: {
    backgroundColor: Colors.white,
    borderColor: Colors.primary,
    elevation: 2,
    shadowColor: Colors.gray900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconContainerActive: {
    backgroundColor: Colors.primaryAlpha,
  },
  typeText: {
    flex: 1,
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.semibold,
    color: Colors.gray600,
  },
  typeTextActive: {
    color: Colors.primary,
  },
  checkmark: {
    marginLeft: Spacing.sm,
  },
});
