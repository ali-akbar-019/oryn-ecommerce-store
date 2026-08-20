import { Text as RNText, TextProps as RNTextProps } from 'react-native';
import { colors, typography } from '@/theme';

type Variant = keyof typeof typography;

export interface TextProps extends RNTextProps {
  variant?: Variant;
  color?: string;
}

export function Text({ variant = 'body', color = colors.text, style, ...props }: TextProps) {
  return <RNText {...props} style={[typography[variant], { color }, style]} />;
}
