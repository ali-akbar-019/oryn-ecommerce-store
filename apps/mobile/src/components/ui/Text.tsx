import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { colors, typography } from '@/theme';

type Variant = 'display' | 'h1' | 'h2' | 'h3' | 'body' | 'bodyMedium' | 'caption' | 'label' | 'overline';

export interface TextProps extends RNTextProps {
  variant?: Variant;
  color?: string;
}

export function Text({ style, variant = 'body', color, ...props }: TextProps) {
  return <RNText {...props} style={[styles.base, typography[variant], color ? { color } : null, style]} />;
}

const styles = StyleSheet.create({
  base: { color: colors.text },
});
