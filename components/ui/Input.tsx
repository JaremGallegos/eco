import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import React, { memo } from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  labelStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  inputContainerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  errorMessage?: string;
  errorStyle?: StyleProp<TextStyle>;
  focused?: boolean;
}

export const Input = memo(function Input({
  label,
  labelStyle,
  containerStyle,
  inputContainerStyle,
  inputStyle,
  leftIcon,
  rightIcon,
  errorMessage,
  errorStyle,
  focused,
  ...props
}: InputProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}
      <View style={[
        styles.inputContainer,
        focused && styles.inputContainerFocused,
        errorMessage && styles.inputContainerError,
        inputContainerStyle
      ]}>
        {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}
        <TextInput
          style={[styles.input, inputStyle]}
          placeholderTextColor={Colors.gray500}
          {...props}
        />
        {rightIcon && <View style={styles.iconContainer}>{rightIcon}</View>}
      </View>
      {errorMessage && (
        <Text style={[styles.error, errorStyle]}>{errorMessage}</Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: Typography.sizes.base,
    color: Colors.light.text,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: Colors.gray300,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    minHeight: 48,
    backgroundColor: Colors.light.background,
    paddingHorizontal: Spacing.sm,
  },
  inputContainerFocused: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  inputContainerError: {
    borderColor: Colors.error,
  },
  input: {
    flex: 1,
    color: Colors.light.text,
    fontSize: Typography.sizes.md,
    minHeight: 48,
    paddingHorizontal: Spacing.sm,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: Spacing.xs,
    minWidth: 24,
  },
  error: {
    marginTop: Spacing.xs,
    fontSize: Typography.sizes.xs,
    color: Colors.error,
  },
});
