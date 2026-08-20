import { Text as RNText, TextProps, StyleSheet } from 'react-native';
import { colors, typography } from '@/theme';

export function Text({ style, ...props }: TextProps) {
  return <RNText {...props} style={[styles.base, style]} />;
}

const styles = StyleSheet.create({
  base: { color: colors.text, ...typography.body },
});
