import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  TextInput,
  TextInputProps,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

interface SearchBarProps extends TextInputProps {
  containerStyle?: StyleProp<ViewStyle>;
  inputContainerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  rightIconContainerStyle?: StyleProp<ViewStyle>;
  leftIconContainerStyle?: StyleProp<ViewStyle>;
  placeholderTextColor?: string;
  showLoading?: boolean;
  loadingProps?: any;
  lightTheme?: boolean;
  round?: boolean;
  onClear?: () => void;
  onCancel?: () => void;
  platform?: 'default' | 'ios' | 'android';
  cancelButtonTitle?: string;
  cancelButtonProps?: any;
  showCancel?: boolean;
}

export function SearchBar({
  containerStyle,
  inputContainerStyle,
  inputStyle,
  rightIconContainerStyle,
  leftIconContainerStyle,
  placeholderTextColor = Colors.iconGray,
  showLoading,
  loadingProps,
  lightTheme,
  round,
  onClear,
  onCancel,
  value,
  onChangeText,
  ...props
}: SearchBarProps) {
  const handleClear = () => {
    onChangeText?.('');
    onClear?.();
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <View
        style={[
          styles.inputContainer,
          round && styles.round,
          inputContainerStyle,
        ]}
      >
        <View style={[styles.leftIcon, leftIconContainerStyle]}>
          <Ionicons name="search" size={24} color={Colors.iconGray} />
        </View>
        <TextInput
          style={[styles.input, inputStyle]}
          placeholderTextColor={placeholderTextColor}
          value={value}
          onChangeText={onChangeText}
          {...props}
        />
        <View style={[styles.rightIcon, rightIconContainerStyle]}>
          {showLoading ? (
            <ActivityIndicator size="small" color={Colors.iconGray} {...loadingProps} />
          ) : value ? (
            <TouchableOpacity onPress={handleClear}>
              <Ionicons name="close-circle" size={20} color={Colors.iconGray} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.darkBackground,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.gray900,
    padding: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.darkBackgroundAlt,
    borderRadius: 3,
    minHeight: 30,
    overflow: 'hidden',
  },
  round: {
    borderRadius: 15,
  },
  input: {
    flex: 1,
    minHeight: 40,
    color: Colors.iconGray,
    fontSize: 18,
    marginLeft: 10,
  },
  leftIcon: {
    marginLeft: 10,
  },
  rightIcon: {
    marginRight: 10,
  },
});
