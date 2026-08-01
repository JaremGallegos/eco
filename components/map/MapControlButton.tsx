import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

interface MapControlButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  active?: boolean;
  activeColor?: string;
}

export const MapControlButton: React.FC<MapControlButtonProps> = ({
  icon,
  onPress,
  active = false,
  activeColor = Colors.info,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        active && { ...styles.buttonActive, borderColor: activeColor },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Ionicons
        name={icon}
        size={24}
        color={active ? activeColor : Colors.primary}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.gray900,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonActive: {
    backgroundColor: `${Colors.info}1a`,
    borderWidth: 2,
  },
});
