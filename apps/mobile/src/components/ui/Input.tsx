import { forwardRef } from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { colors, radii, spacing, typography } from '@/theme';
import { Text } from './Text';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, error, style, ...props },
  ref
) {
  return (
    <View style={styles.wrapper}>
      {label ? (
        <Text variant="label" color={colors.textSecondary} style={styles.label}>
          {label}
        </Text>
      ) : null}

      <TextInput
        ref={ref}
        placeholderTextColor={colors.textMuted}
        {...props}
        style={[styles.input, error && styles.inputError, style]}
      />

      {error ? (
        <Text variant="caption" color={colors.danger} style={styles.error}>
          {error}
        </Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.sm
  },
  label: {
    textTransform: 'uppercase'
  },
  input: {
    minHeight: 52,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    color: colors.text,
    ...typography.body
  },
  inputError: {
    borderColor: colors.danger
  },
  error: {
    marginTop: -2
  }
});